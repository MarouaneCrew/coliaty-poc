import { GeocodingService } from './geocoding.service';
import { PrismaService } from '../prisma/prisma.service';
export declare class GeocodingQueue {
    private geocoding;
    private prisma;
    private readonly logger;
    private queue;
    private processing;
    constructor(geocoding: GeocodingService, prisma: PrismaService);
    add(shipmentId: string): void;
    private process;
}
