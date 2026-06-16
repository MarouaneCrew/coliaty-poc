import { Injectable, Logger } from '@nestjs/common';
import NodeGeocoder from 'node-geocoder';

@Injectable()
export class GeocodingService {
    private readonly logger = new Logger(GeocodingService.name);
    private geocoder: NodeGeocoder.Geocoder;
    private queue: (() => Promise<void>)[] = [];
    private processing = false;
    private lastCallTime = 0;
    private readonly minIntervalMs = 1100; // Nominatim limit: 1 request/sec

    constructor() {
        this.geocoder = NodeGeocoder({
            provider: 'openstreetmap',
            userAgent: 'ColiatyPOC',
            // Use your email if needed
            email: 'demo@coliaty.com',
            language: 'ar', // help in Morocco
            countrycodes: 'ma',
        } as any);
    }

    // Public method that enqueues a geocode operation
    geocode(address: string): Promise<{ lat: number; lng: number; } | null> {
        return new Promise((resolve) => {
            this.queue.push(async () => {
                try {
                    const res = await this.geocodeOnce(address);
                    resolve(res);
                } catch (err) {
                    const message = err instanceof Error ? err.message : String(err);
                    this.logger.error(`Geocode failed: ${message}`);
                    resolve(null);
                }
            });
            this.processQueue();
        });
    }

    async geocodeOnce(address: string): Promise<{ lat: number; lng: number; } | null> {
        const results = await this.geocoder.geocode(address);

        if (!results.length) return null;

        const r = results[0];

        if (!r.latitude || !r.longitude) return null;

        return {
            lat: r.latitude,
            lng: r.longitude,
        };
    }

    private async processQueue() {
        if (this.processing) return;
        this.processing = true;
        while (this.queue.length > 0) {
            const now = Date.now();
            const timeSinceLastCall = now - this.lastCallTime;
            if (timeSinceLastCall < this.minIntervalMs) {
                await this.sleep(this.minIntervalMs - timeSinceLastCall);
            }
            const task = this.queue.shift();
            if (task) {
                await task();
                this.lastCallTime = Date.now();
            }
        }
        this.processing = false;
    }

    private sleep(ms: number) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}