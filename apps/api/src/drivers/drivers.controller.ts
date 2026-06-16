import { Controller, Get, Query } from '@nestjs/common';
import { DriversService } from './drivers.service';

@Controller('drivers')
export class DriversController {
    constructor(private readonly driversService: DriversService) { }

    @Get('stats')
    getStats(@Query('date') date: string) {
        return this.driversService.getStats(date);
    }
}