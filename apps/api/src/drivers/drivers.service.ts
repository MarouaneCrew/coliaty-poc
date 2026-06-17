import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DriversService {
    constructor(private prisma: PrismaService) { }

    async getStats(from?: string, to?: string) {
        const where: any = {};

        if (from && to) {
            const start = new Date(from);

            const end = new Date(to);
            end.setDate(end.getDate() + 1);

            where.attemptedAt = {
                gte: start,
                lt: end,
            };
        }

        const shipments = await this.prisma.shipment.findMany({ where });

        // Group by driver
        const driverMap = new Map<string, { total: number; delivered: number; failed: number; reasons: any; codMissing: number; }>();
        for (const s of shipments) {
            if (!driverMap.has(s.driver)) {
                driverMap.set(s.driver, { total: 0, delivered: 0, failed: 0, reasons: {}, codMissing: 0 });
            }
            const stats = driverMap.get(s.driver)!;
            stats.total++;
            if (s.status === 'DELIVERED') {
                stats.delivered++;
                if (s.codAmount && s.codAmount > 0) {
                    // in a real app we'd have a separate COD collection record; for MVP, we'll check if delivery has codAmount but no collection timestamp (not present yet)
                    // We'll simply flag if the delivery has no collection proof later.
                }
            }
            if (s.status === 'FAILED') {
                stats.failed++;
                const reason = s.failureReason || 'OTHER';
                stats.reasons[reason] = (stats.reasons[reason] || 0) + 1;
            }
        }

        return Array.from(driverMap.entries()).map(([driver, stats]) => ({
            driver,
            total: stats.total,
            delivered: stats.delivered,
            failed: stats.failed,
            failureRate: stats.total > 0 ? ((stats.failed / stats.total) * 100).toFixed(1) : '0.0',
            reasons: stats.reasons,
            codMissing: stats.codMissing,
        }));
    }
}