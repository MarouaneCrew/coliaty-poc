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
    findAll(status: string, driver: string, merchant: string, date: string): Promise<{
        lat: number | null;
        lng: number | null;
        id: string;
        orderId: string;
        batchId: string;
        merchant: string;
        addressText: string;
        customerPhone: string | null;
        driver: string;
        status: import("@prisma/client").$Enums.ShipmentStatus;
        failureReason: import("@prisma/client").$Enums.FailureReason | null;
        codAmount: number | null;
        attemptedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findOne(id: string): Promise<{
        lat: number | null;
        lng: number | null;
        id: string;
        orderId: string;
        batchId: string;
        merchant: string;
        addressText: string;
        customerPhone: string | null;
        driver: string;
        status: import("@prisma/client").$Enums.ShipmentStatus;
        failureReason: import("@prisma/client").$Enums.FailureReason | null;
        codAmount: number | null;
        attemptedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    } | null>;
    getDaily(date?: string): Promise<{
        total: number;
        delivered: number;
        failed: number;
        outForDelivery: number;
        deliveryRate: number;
        failureRate: number;
        codTotal: number;
    }>;
    getFailureReasons(date?: string): Promise<{
        ADDRESS_INCORRECT: number;
        CLIENT_ABSENT: number;
        COD_REFUSED: number;
        OTHER: number;
    }>;
    getMerchantStats(date?: string): Promise<any[]>;
    getBatches(): Promise<{
        id: string;
        status: string;
        createdAt: Date;
        fileName: string | null;
        totalRows: number;
        successRows: number;
        failedRows: number;
    }[]>;
}
