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
exports.ShipmentsAnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let ShipmentsAnalyticsService = class ShipmentsAnalyticsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getDailyStats(date) {
        const targetDate = date ? new Date(date) : new Date();
        const start = new Date(targetDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(targetDate);
        end.setHours(23, 59, 59, 999);
        const shipments = await this.prisma.shipment.findMany({
            where: {
                attemptedAt: {
                    gte: start,
                    lte: end,
                },
            },
        });
        const total = shipments.length;
        const delivered = shipments.filter((s) => s.status === client_1.ShipmentStatus.DELIVERED).length;
        const failed = shipments.filter((s) => s.status === client_1.ShipmentStatus.FAILED).length;
        const outForDelivery = shipments.filter((s) => s.status === client_1.ShipmentStatus.OUT_FOR_DELIVERY).length;
        const codTotal = shipments.reduce((sum, s) => {
            return sum + (s.codAmount || 0);
        }, 0);
        return {
            total,
            delivered,
            failed,
            outForDelivery,
            deliveryRate: total ? (delivered / total) * 100 : 0,
            failureRate: total ? (failed / total) * 100 : 0,
            codTotal,
        };
    }
    async getFailureReasons(date) {
        const where = {};
        if (date) {
            const start = new Date(date);
            const end = new Date(date);
            end.setHours(23, 59, 59, 999);
            where.attemptedAt = {
                gte: start,
                lte: end,
            };
        }
        const failed = await this.prisma.shipment.findMany({
            where: {
                ...where,
                status: 'FAILED',
            },
        });
        const counts = {
            ADDRESS_INCORRECT: 0,
            CLIENT_ABSENT: 0,
            COD_REFUSED: 0,
            OTHER: 0,
        };
        failed.forEach(s => {
            if (s.failureReason)
                counts[s.failureReason]++;
        });
        return counts;
    }
    async getMerchantStats(date) {
        const targetDate = date ? new Date(date) : null;
        const where = {};
        if (targetDate) {
            const start = new Date(targetDate);
            start.setHours(0, 0, 0, 0);
            const end = new Date(targetDate);
            end.setHours(23, 59, 59, 999);
            where.attemptedAt = {
                gte: start,
                lte: end,
            };
        }
        const shipments = await this.prisma.shipment.findMany({
            where,
        });
        const map = {};
        for (const s of shipments) {
            if (!map[s.merchant]) {
                map[s.merchant] = {
                    merchant: s.merchant,
                    total: 0,
                    delivered: 0,
                    failed: 0,
                };
            }
            map[s.merchant].total++;
            if (s.status === 'DELIVERED')
                map[s.merchant].delivered++;
            if (s.status === 'FAILED')
                map[s.merchant].failed++;
        }
        return Object.values(map).map((m) => ({
            ...m,
            failureRate: m.total ? (m.failed / m.total) * 100 : 0,
        }));
    }
};
exports.ShipmentsAnalyticsService = ShipmentsAnalyticsService;
exports.ShipmentsAnalyticsService = ShipmentsAnalyticsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ShipmentsAnalyticsService);
//# sourceMappingURL=shipments.analytics.js.map