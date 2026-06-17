import { PrismaService } from '../prisma/prisma.service';
export declare class DriversService {
    private prisma;
    constructor(prisma: PrismaService);
    getStats(from?: string, to?: string): Promise<{
        driver: string;
        total: number;
        delivered: number;
        failed: number;
        failureRate: string;
        reasons: any;
        codMissing: number;
    }[]>;
}
