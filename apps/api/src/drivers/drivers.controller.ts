import { Controller, Get, Query } from '@nestjs/common';
import { DriversService } from './drivers.service';

@Controller('drivers')
export class DriversController {
    constructor(private readonly driversService: DriversService) { }

    @Get('stats')
    getStats(
        @Query('from') from?: string,
        @Query('to') to?: string,
    ) {
        return this.driversService.getStats(from, to);
    }
}