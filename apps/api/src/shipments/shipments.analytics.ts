import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ShipmentStatus } from '@prisma/client';

@Injectable()
export class ShipmentsAnalyticsService {
    constructor(private prisma: PrismaService) { }

    async getDailyStats(date?: string) {
        const targetDate = date ? new Date(date) : new Date();

        const start = new Date(targetDate);
        start.setHours(0, 0, 0, 0);

        const end = new Date(targetDate);
        end.setHours(23, 59, 59, 999);

        const shipments = await this.prisma.shipment.findMany({
            where: {
                attemptedAt: {
                    gte: start,
                    lte: end,
                },
            },
        });

        const total = shipments.length;

        const delivered = shipments.filter(
            (s) => s.status === ShipmentStatus.DELIVERED,
        ).length;

        const failed = shipments.filter(
            (s) => s.status === ShipmentStatus.FAILED,
        ).length;

        const outForDelivery = shipments.filter(
            (s) => s.status === ShipmentStatus.OUT_FOR_DELIVERY,
        ).length;

        const codTotal = shipments.reduce((sum, s) => {
            return sum + (s.codAmount || 0);
        }, 0);

        return {
            total,
            delivered,
            failed,
            outForDelivery,
            deliveryRate: total ? (delivered / total) * 100 : 0,
            failureRate: total ? (failed / total) * 100 : 0,
            codTotal,
        };
    }

    async getFailureReasons(date?: string) {
        const where: any = {};

        if (date) {
            const start = new Date(date);
            const end = new Date(date);
            end.setHours(23, 59, 59, 999);

            where.attemptedAt = {
                gte: start,
                lte: end,
            };
        }

        const failed = await this.prisma.shipment.findMany({
            where: {
                ...where,
                status: 'FAILED',
            },
        });

        const counts = {
            ADDRESS_INCORRECT: 0,
            CLIENT_ABSENT: 0,
            COD_REFUSED: 0,
            OTHER: 0,
        };

        failed.forEach(s => {
            if (s.failureReason)
                counts[s.failureReason]++;
        });

        return counts;
    }

    async getMerchantStats(date?: string) {
        const targetDate = date ? new Date(date) : null;

        const where: any = {};

        if (targetDate) {
            const start = new Date(targetDate);
            start.setHours(0, 0, 0, 0);

            const end = new Date(targetDate);
            end.setHours(23, 59, 59, 999);

            where.attemptedAt = {
                gte: start,
                lte: end,
            };
        }

        const shipments = await this.prisma.shipment.findMany({
            where,
        });

        const map: Record<string, any> = {};

        for (const s of shipments) {
            if (!map[s.merchant]) {
                map[s.merchant] = {
                    merchant: s.merchant,
                    total: 0,
                    delivered: 0,
                    failed: 0,
                };
            }

            map[s.merchant].total++;

            if (s.status === 'DELIVERED') map[s.merchant].delivered++;
            if (s.status === 'FAILED') map[s.merchant].failed++;
        }

        return Object.values(map).map((m: any) => ({
            ...m,
            failureRate: m.total ? (m.failed / m.total) * 100 : 0,
        }));
    }
}