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
exports.DriversService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let DriversService = class DriversService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getStats(from, to) {
        const where = {};
        if (from && to) {
            const start = new Date(from);
            const end = new Date(to);
            end.setDate(end.getDate() + 1);
            where.attemptedAt = {
                gte: start,
                lt: end,
            };
        }
        const shipments = await this.prisma.shipment.findMany({ where });
        const driverMap = new Map();
        for (const s of shipments) {
            if (!driverMap.has(s.driver)) {
                driverMap.set(s.driver, { total: 0, delivered: 0, failed: 0, reasons: {}, codMissing: 0 });
            }
            const stats = driverMap.get(s.driver);
            stats.total++;
            if (s.status === 'DELIVERED') {
                stats.delivered++;
                if (s.codAmount && s.codAmount > 0) {
                }
            }
            if (s.status === 'FAILED') {
                stats.failed++;
                const reason = s.failureReason || 'OTHER';
                stats.reasons[reason] = (stats.reasons[reason] || 0) + 1;
            }
        }
        return Array.from(driverMap.entries()).map(([driver, stats]) => ({
            driver,
            total: stats.total,
            delivered: stats.delivered,
            failed: stats.failed,
            failureRate: stats.total > 0 ? ((stats.failed / stats.total) * 100).toFixed(1) : '0.0',
            reasons: stats.reasons,
            codMissing: stats.codMissing,
        }));
    }
};
exports.DriversService = DriversService;
exports.DriversService = DriversService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DriversService);
//# sourceMappingURL=drivers.service.js.map