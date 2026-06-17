import { PrismaService } from '../prisma/prisma.service';
export declare class ShipmentsAnalyticsService {
    private prisma;
    constructor(prisma: PrismaService);
    private buildDateFilter;
    getStats(from?: string, to?: string): Promise<{
        total: number;
        delivered: number;
        failed: number;
        outForDelivery: number;
        deliveryRate: number;
        failureRate: number;
        codTotal: number;
    }>;
    getFailureReasons(from?: string, to?: string): Promise<{
        ADDRESS_INCORRECT: number;
        CLIENT_ABSENT: number;
        COD_REFUSED: number;
        OTHER: number;
    }>;
    getMerchantStats(from?: string, to?: string): Promise<any[]>;
}
