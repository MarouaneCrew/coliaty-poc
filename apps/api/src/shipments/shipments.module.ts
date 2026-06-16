import { Module } from '@nestjs/common';
import { ShipmentsController } from './shipments.controller';
import { ShipmentsService } from './shipments.service';
import { PrismaService } from '../prisma/prisma.service';
import { GeocodingService } from '../geocoding/geocoding.service';
import { GeocodingQueue } from '../geocoding/geocoding.queue';
import { ShipmentsAnalyticsService } from './shipments.analytics';

@Module({
    controllers: [ShipmentsController],
    providers: [ShipmentsService, PrismaService, GeocodingService, GeocodingQueue, ShipmentsAnalyticsService],
})
export class ShipmentsModule { }