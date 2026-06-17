import { Controller, Post, Get, Param, Query, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ShipmentsService } from './shipments.service';
import { ShipmentsAnalyticsService } from './shipments.analytics';

@Controller('shipments')
export class ShipmentsController {
    constructor(private readonly shipmentsService: ShipmentsService, private readonly analytics: ShipmentsAnalyticsService,) { }

    @Post('upload')
    @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 5 * 1024 * 1024 } }))
    async uploadCsv(@UploadedFile() file: any) {
        if (!file || file.mimetype !== 'text/csv') {
            throw new BadRequestException('CSV file required');
        }
        return this.shipmentsService.uploadCsv(file);
    }

    @Get()
    findAll(
        @Query('status') status: string,
        @Query('driver') driver: string,
        @Query('merchant') merchant: string,
        @Query('from') from: string,
        @Query('to') to: string,
    ) {
        return this.shipmentsService.findAll({ status, driver, merchant, from, to });
    }

    @Get('/stats')
    getStats(
        @Query('from') from?: string,
        @Query('to') to?: string,
    ) {
        return this.analytics.getStats(from, to);
    }

    @Get('stats/failure-reasons')
    getFailureReasons(
        @Query('from') from?: string,
        @Query('to') to?: string,
    ) {
        return this.analytics.getFailureReasons(from, to);
    }

    @Get('stats/merchants')
    getMerchantStats(
        @Query('from') from?: string,
        @Query('to') to?: string,
    ) {
        return this.analytics.getMerchantStats(from, to);
    }

    @Get('batches')
    getBatches() {
        return this.shipmentsService.getBatches();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.shipmentsService.findOne(id);
    }
}