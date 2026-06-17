import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GeocodingService } from '../geocoding/geocoding.service';
import { parse } from 'csv-parse';
import { Readable } from 'stream';
import { ShipmentStatus, FailureReason } from '@prisma/client';
import { GeocodingQueue } from '../geocoding/geocoding.queue';

@Injectable()
export class ShipmentsService {
    constructor(
        private prisma: PrismaService,
        private geocoding: GeocodingService,
        private geocodingQueue: GeocodingQueue,
    ) { }

    async uploadCsv(file: any) {
        if (!file) throw new BadRequestException('No file');

        // 1. Create upload batch
        const batch = await this.prisma.uploadBatch.create({
            data: {
                fileName: file.originalname ?? 'upload.csv',
                totalRows: 0,
                successRows: 0,
                failedRows: 0,
                status: 'PROCESSING',
            },
        });

        // 2. Parse CSV
        const records: any[] = await this.parseCsv(file.buffer);

        // 3. Strict schema validation
        const REQUIRED_COLUMNS = [
            'order_id',
            'merchant',
            'address',
            'customer_phone',
            'driver',
            'status',
            'failure_reason',
            'cod_amount',
        ];

        const headers = Object.keys(records[0] || {});

        const missing = REQUIRED_COLUMNS.filter(
            (col) => !headers.includes(col),
        );

        const extra = headers.filter(
            (col) => !REQUIRED_COLUMNS.includes(col),
        );

        if (missing.length > 0) {
            throw new BadRequestException({
                error: 'INVALID_FILE_SCHEMA',
                message: 'CSV structure does not match expected format',
                missingColumns: missing,
                extraColumns: extra,
            });
        }

        // 4. Process rows
        const shipments: any[] = [];
        let success = 0;
        let failed = 0;

        for (const row of records) {
            const {
                order_id,
                merchant,
                address,
                customer_phone,
                driver,
                status,
                failure_reason,
                cod_amount,
            } = row;

            if (!order_id || !address) {
                failed++;
                continue;
            }

            let shipmentStatus: ShipmentStatus =
                ShipmentStatus.OUT_FOR_DELIVERY;

            let failReason: FailureReason | null = null;

            if (status?.toUpperCase() === 'DELIVERED') {
                shipmentStatus = ShipmentStatus.DELIVERED;
            }

            if (status?.toUpperCase() === 'FAILED') {
                shipmentStatus = ShipmentStatus.FAILED;
                failReason = this.mapFailureReason(failure_reason);
            }

            try {
                const shipment = await this.prisma.shipment.create({
                    data: {
                        batchId: batch.id,

                        orderId: order_id,
                        merchant: merchant || '',
                        addressText: address,

                        lat: null,
                        lng: null,

                        customerPhone: customer_phone || null,
                        driver: driver || 'Unassigned',
                        status: shipmentStatus,
                        failureReason: failReason,
                        codAmount: cod_amount
                            ? parseFloat(cod_amount)
                            : null,
                        attemptedAt: new Date(),
                    },
                });

                success++;
                shipments.push(shipment);

                // async geocoding
                this.geocodingQueue.add(shipment.id);
            } catch {
                failed++;
            }
        }

        // 5. update batch
        await this.prisma.uploadBatch.update({
            where: { id: batch.id },
            data: {
                totalRows: records.length,
                successRows: success,
                failedRows: failed,
                status: 'DONE',
            },
        });

        return {
            batchId: batch.id,
            inserted: success,
            failed,
            total: records.length,
        };
    }

    async findAll(filters?: {
        status?: string;
        driver?: string;
        merchant?: string;
        from?: string;
        to?: string;
        batchId?: string;
    }) {
        const where: any = {};

        if (filters?.status) {
            where.status = filters.status.toUpperCase();
        }

        if (filters?.driver) where.driver = filters.driver;
        if (filters?.merchant) where.merchant = filters.merchant;
        if (filters?.batchId) where.batchId = filters.batchId;

        if (filters?.from && filters?.to) {
            const start = new Date(filters.from);
            const end = new Date(filters.to);
            end.setDate(end.getDate() + 1);

            where.attemptedAt = {
                gte: start,
                lt: end,
            };
        }

        return this.prisma.shipment.findMany({
            where,
            orderBy: { attemptedAt: 'desc' },
        });
    }

    async findOne(id: string) {
        return this.prisma.shipment.findUnique({
            where: { id },
        });
    }

    // ----------------------------
    // CSV PARSER (FIXED)
    // ----------------------------
    private parseCsv(buffer: Buffer): Promise<any[]> {
        return new Promise((resolve, reject) => {
            const records: any[] = [];

            const parser = parse({
                columns: (header) => header.map((h) => h.trim()),
                skip_empty_lines: true,
                trim: true,
            });

            parser.on('readable', () => {
                let record;
                while ((record = parser.read())) {
                    records.push(record);
                }
            });

            parser.on('error', reject);
            parser.on('end', () => resolve(records));

            const stream = new Readable();
            stream.push(buffer);
            stream.push(null);
            stream.pipe(parser);
        });
    }

    private mapFailureReason(reason: string): FailureReason | null {
        if (!reason) return null;

        const r = reason.toLowerCase();

        if (r.includes('address')) return FailureReason.ADDRESS_INCORRECT;
        if (r.includes('absent')) return FailureReason.CLIENT_ABSENT;
        if (r.includes('cod')) return FailureReason.COD_REFUSED;

        return FailureReason.OTHER;
    }

    async getBatches() {
        return this.prisma.uploadBatch.findMany({
            orderBy: {
                createdAt: 'desc',
            },
        });
    }
}