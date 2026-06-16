import { PrismaService } from '../prisma/prisma.service';
import { GeocodingService } from '../geocoding/geocoding.service';
import { GeocodingQueue } from '../geocoding/geocoding.queue';
export declare class ShipmentsService {
    private prisma;
    private geocoding;
    private geocodingQueue;
    constructor(prisma: PrismaService, geocoding: GeocodingService, geocodingQueue: GeocodingQueue);
    uploadCsv(file: any): Promise<{
        batchId: string;
        inserted: number;
        failed: number;
        total: number;
    }>;
    findAll(filters?: {
        status?: string;
        driver?: string;
        merchant?: string;
        date?: string;
        batchId?: string;
    }): Promise<{
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
    private parseCsv;
    private mapFailureReason;
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
