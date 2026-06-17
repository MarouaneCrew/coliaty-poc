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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShipmentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const geocoding_service_1 = require("../geocoding/geocoding.service");
const csv_parse_1 = require("csv-parse");
const stream_1 = require("stream");
const client_1 = require("@prisma/client");
const geocoding_queue_1 = require("../geocoding/geocoding.queue");
let ShipmentsService = class ShipmentsService {
    prisma;
    geocoding;
    geocodingQueue;
    constructor(prisma, geocoding, geocodingQueue) {
        this.prisma = prisma;
        this.geocoding = geocoding;
        this.geocodingQueue = geocodingQueue;
    }
    async uploadCsv(file) {
        if (!file)
            throw new common_1.BadRequestException('No file');
        const batch = await this.prisma.uploadBatch.create({
            data: {
                fileName: file.originalname ?? 'upload.csv',
                totalRows: 0,
                successRows: 0,
                failedRows: 0,
                status: 'PROCESSING',
            },
        });
        const records = await this.parseCsv(file.buffer);
        const shipments = [];
        let success = 0;
        let failed = 0;
        for (const row of records) {
            const { order_id, merchant, address, customer_phone, driver, status, failure_reason, cod_amount, } = row;
            if (!order_id || !address) {
                failed++;
                continue;
            }
            let shipmentStatus = client_1.ShipmentStatus.OUT_FOR_DELIVERY;
            let failReason = null;
            if (status?.toUpperCase() === 'DELIVERED') {
                shipmentStatus = client_1.ShipmentStatus.DELIVERED;
            }
            if (status?.toUpperCase() === 'FAILED') {
                shipmentStatus = client_1.ShipmentStatus.FAILED;
                failReason = this.mapFailureReason(failure_reason);
            }
            try {
                const shipment = await this.prisma.shipment.create({
                    data: {
                        batchId: batch.id,
                        orderId: order_id,
                        merchant: merchant || '',
                        addressText: address,
                        lat: null,
                        lng: null,
                        customerPhone: customer_phone || null,
                        driver: driver || 'Unassigned',
                        status: shipmentStatus,
                        failureReason: failReason,
                        codAmount: cod_amount ? parseFloat(cod_amount) : null,
                        attemptedAt: new Date(),
                    },
                });
                success++;
                shipments.push(shipment);
                this.geocodingQueue.add(shipment.id);
            }
            catch (e) {
                failed++;
                continue;
            }
        }
        await this.prisma.uploadBatch.update({
            where: { id: batch.id },
            data: {
                totalRows: records.length,
                successRows: success,
                failedRows: failed,
                status: 'DONE',
            },
        });
        return {
            batchId: batch.id,
            inserted: success,
            failed,
            total: records.length,
        };
    }
    async findAll(filters) {
        const where = {};
        if (filters?.status) {
            where.status = filters.status.toUpperCase();
        }
        if (filters?.driver)
            where.driver = filters.driver;
        if (filters?.merchant)
            where.merchant = filters.merchant;
        if (filters?.batchId)
            where.batchId = filters.batchId;
        if (filters?.from && filters?.to) {
            const start = new Date(filters.from);
            const end = new Date(filters.to);
            end.setDate(end.getDate() + 1);
            where.attemptedAt = {
                gte: start,
                lt: end,
            };
        }
        return this.prisma.shipment.findMany({
            where,
            orderBy: { attemptedAt: 'desc' },
        });
    }
    async findOne(id) {
        return this.prisma.shipment.findUnique({
            where: { id },
        });
    }
    parseCsv(buffer) {
        return new Promise((resolve, reject) => {
            const records = [];
            const parser = (0, csv_parse_1.parse)({
                columns: true,
                skip_empty_lines: true,
                trim: true,
            });
            parser.on('readable', () => {
                let record;
                while ((record = parser.read())) {
                    records.push(record);
                }
            });
            parser.on('error', reject);
            parser.on('end', () => resolve(records));
            const stream = new stream_1.Readable();
            stream.push(buffer);
            stream.push(null);
            stream.pipe(parser);
        });
    }
    mapFailureReason(reason) {
        if (!reason)
            return null;
        const r = reason.toLowerCase();
        if (r.includes('address'))
            return client_1.FailureReason.ADDRESS_INCORRECT;
        if (r.includes('absent'))
            return client_1.FailureReason.CLIENT_ABSENT;
        if (r.includes('cod'))
            return client_1.FailureReason.COD_REFUSED;
        return client_1.FailureReason.OTHER;
    }
    async getBatches() {
        return this.prisma.uploadBatch.findMany({
            orderBy: {
                createdAt: 'desc',
            },
        });
    }
};
exports.ShipmentsService = ShipmentsService;
exports.ShipmentsService = ShipmentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        geocoding_service_1.GeocodingService,
        geocoding_queue_1.GeocodingQueue])
], ShipmentsService);
//# sourceMappingURL=shipments.service.js.map