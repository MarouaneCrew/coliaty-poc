import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ShipmentStatus } from '@prisma/client';

@Injectable()
export class ShipmentsAnalyticsService {
    constructor(private prisma: PrismaService) { }

    private buildDateFilter(from?: string, to?: string) {
        if (!from || !to) return {};

        const start = new Date(from);

        const end = new Date(to);
        end.setDate(end.getDate() + 1);

        return {
            attemptedAt: {
                gte: start,
                lt: end,
            },
        };
    }

    async getStats(from?: string, to?: string) {
        const shipments = await this.prisma.shipment.findMany({
            where: this.buildDateFilter(from, to)
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

    async getFailureReasons(from?: string, to?: string) {
        const where = this.buildDateFilter(from, to);

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

    async getMerchantStats(from?: string, to?: string) {
        const where = this.buildDateFilter(from, to);

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