import { DriversService } from './drivers.service';
export declare class DriversController {
    private readonly driversService;
    constructor(driversService: DriversService);
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
