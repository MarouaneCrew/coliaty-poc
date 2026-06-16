"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var GeocodingQueue_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeocodingQueue = void 0;
const common_1 = require("@nestjs/common");
const geocoding_service_1 = require("./geocoding.service");
const prisma_service_1 = require("../prisma/prisma.service");
let GeocodingQueue = GeocodingQueue_1 = class GeocodingQueue {
    geocoding;
    prisma;
    logger = new common_1.Logger(GeocodingQueue_1.name);
    queue = [];
    processing = false;
    constructor(geocoding, prisma) {
        this.geocoding = geocoding;
        this.prisma = prisma;
    }
    add(shipmentId) {
        this.queue.push(shipmentId);
        this.process();
    }
    async process() {
        if (this.processing)
            return;
        this.processing = true;
        while (this.queue.length > 0) {
            const shipmentId = this.queue.shift();
            if (!shipmentId)
                continue;
            try {
                const shipment = await this.prisma.shipment.findUnique({
                    where: { id: shipmentId },
                });
                if (!shipment || shipment.lat || shipment.lng) {
                    continue;
                }
                const coords = await this.geocoding.geocodeOnce(shipment.addressText);
                if (!coords) {
                    this.logger.warn(`No coords found for ${shipment.orderId}`);
                    continue;
                }
                await this.prisma.shipment.update({
                    where: { id: shipmentId },
                    data: {
                        lat: coords.lat,
                        lng: coords.lng,
                    },
                });
            }
            catch (err) {
                this.logger.error(`Failed geocoding shipment ${shipmentId}`);
            }
        }
        this.processing = false;
    }
};
exports.GeocodingQueue = GeocodingQueue;
exports.GeocodingQueue = GeocodingQueue = GeocodingQueue_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [geocoding_service_1.GeocodingService,
        prisma_service_1.PrismaService])
], GeocodingQueue);
//# sourceMappingURL=geocoding.queue.js.map