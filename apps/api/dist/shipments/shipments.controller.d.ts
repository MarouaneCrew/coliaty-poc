import { ShipmentsService } from './shipments.service';
import { ShipmentsAnalyticsService } from './shipments.analytics';
export declare class ShipmentsController {
    private readonly shipmentsService;
    private readonly analytics;
    constructor(shipmentsService: ShipmentsService, analytics: ShipmentsAnalyticsService);
    uploadCsv(file: any): Promise<{
        batchId: string;
        inserted: number;
        failed: number;
        total: number;
    }>;
    findAll(status: string, driver: string, merchant: string, from: string, to: string): Promise<{
        id: string;
        status: import("@prisma/client").$Enums.ShipmentStatus;
        createdAt: Date;
        orderId: string;
        batchId: string;
        merchant: string;
        addressText: string;
        lat: number | null;
        lng: number | null;
        customerPhone: string | null;
        driver: string;
        failureReason: import("@prisma/client").$Enums.FailureReason | null;
        codAmount: number | null;
        attemptedAt: Date | null;
        updatedAt: Date;
    }[]>;
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
    getBatches(): Promise<{
        id: string;
        fileName: string | null;
        totalRows: number;
        successRows: number;
        failedRows: number;
        status: string;
        createdAt: Date;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        status: import("@prisma/client").$Enums.ShipmentStatus;
        createdAt: Date;
        orderId: string;
        batchId: string;
        merchant: string;
        addressText: string;
        lat: number | null;
        lng: number | null;
        customerPhone: string | null;
        driver: string;
        failureReason: import("@prisma/client").$Enums.FailureReason | null;
        codAmount: number | null;
        attemptedAt: Date | null;
        updatedAt: Date;
    } | null>;
}
