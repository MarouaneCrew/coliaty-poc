import { Module } from '@nestjs/common';
import { DriversController } from './drivers.controller';
import { DriversService } from './drivers.service';
import { PrismaService } from '../prisma/prisma.service';
import { GeocodingService } from '../geocoding/geocoding.service';

@Module({
    controllers: [DriversController],
    providers: [DriversService, PrismaService, GeocodingService],
})
export class DriversModule { }