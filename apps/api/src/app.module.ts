import { Module } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { GeocodingService } from './geocoding/geocoding.service';
import { ShipmentsModule } from './shipments/shipments.module';
import { DriversModule } from './drivers/drivers.module';
// import { ServeStaticModule } from '@nestjs/serve-static'; // not needed if separate
// Not needed for API only

@Module({
  imports: [
    ShipmentsModule,
    DriversModule,
  ],
  controllers: [],
  providers: [PrismaService, GeocodingService],
})
export class AppModule { }