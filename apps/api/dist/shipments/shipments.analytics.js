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
    buildDateFilter(from, to) {
        if (!from || !to)
            return {};
        const start = new Date(from);
        const end = new Date(to);
        end.setDate(end.getDate() + 1);
        return {
            attemptedAt: {
                gte: start,
                lt: end,
            },
        };
    }
    async getStats(from, to) {
        const shipments = await this.prisma.shipment.findMany({
            where: this.buildDateFilter(from, to)
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
    async getFailureReasons(from, to) {
        const where = this.buildDateFilter(from, to);
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
    async getMerchantStats(from, to) {
        const where = this.buildDateFilter(from, to);
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