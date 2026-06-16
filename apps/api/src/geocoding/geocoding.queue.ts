import { Injectable, Logger } from '@nestjs/common';
import { GeocodingService } from './geocoding.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GeocodingQueue {
    private readonly logger = new Logger(GeocodingQueue.name);

    private queue: string[] = [];
    private processing = false;

    constructor(
        private geocoding: GeocodingService,
        private prisma: PrismaService,
    ) { }

    /**
     * Add shipment to geocoding queue
     */
    add(shipmentId: string) {
        this.queue.push(shipmentId);
        this.process();
    }

    /**
     * Worker loop
     */
    private async process() {
        if (this.processing) return;

        this.processing = true;

        while (this.queue.length > 0) {
            const shipmentId = this.queue.shift();
            if (!shipmentId) continue;

            try {
                const shipment = await this.prisma.shipment.findUnique({
                    where: { id: shipmentId },
                });

                if (!shipment || shipment.lat || shipment.lng) {
                    continue;
                }

                const coords = await this.geocoding.geocodeOnce(
                    shipment.addressText,
                );

                if (!coords) {
                    this.logger.warn(
                        `No coords found for ${shipment.orderId}`,
                    );
                    continue;
                }

                await this.prisma.shipment.update({
                    where: { id: shipmentId },
                    data: {
                        lat: coords.lat,
                        lng: coords.lng,
                    },
                });
            } catch (err) {
                this.logger.error(
                    `Failed geocoding shipment ${shipmentId}`,
                );
            }
        }

        this.processing = false;
    }
}