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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShipmentsController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const shipments_service_1 = require("./shipments.service");
const shipments_analytics_1 = require("./shipments.analytics");
let ShipmentsController = class ShipmentsController {
    shipmentsService;
    analytics;
    constructor(shipmentsService, analytics) {
        this.shipmentsService = shipmentsService;
        this.analytics = analytics;
    }
    async uploadCsv(file) {
        if (!file || file.mimetype !== 'text/csv') {
            throw new common_1.BadRequestException('CSV file required');
        }
        return this.shipmentsService.uploadCsv(file);
    }
    findAll(status, driver, merchant, from, to) {
        return this.shipmentsService.findAll({ status, driver, merchant, from, to });
    }
    getStats(from, to) {
        return this.analytics.getStats(from, to);
    }
    getFailureReasons(from, to) {
        return this.analytics.getFailureReasons(from, to);
    }
    getMerchantStats(from, to) {
        return this.analytics.getMerchantStats(from, to);
    }
    getBatches() {
        return this.shipmentsService.getBatches();
    }
    findOne(id) {
        return this.shipmentsService.findOne(id);
    }
};
exports.ShipmentsController = ShipmentsController;
__decorate([
    (0, common_1.Post)('upload'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', { limits: { fileSize: 5 * 1024 * 1024 } })),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ShipmentsController.prototype, "uploadCsv", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('status')),
    __param(1, (0, common_1.Query)('driver')),
    __param(2, (0, common_1.Query)('merchant')),
    __param(3, (0, common_1.Query)('from')),
    __param(4, (0, common_1.Query)('to')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], ShipmentsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('/stats'),
    __param(0, (0, common_1.Query)('from')),
    __param(1, (0, common_1.Query)('to')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ShipmentsController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)('stats/failure-reasons'),
    __param(0, (0, common_1.Query)('from')),
    __param(1, (0, common_1.Query)('to')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ShipmentsController.prototype, "getFailureReasons", null);
__decorate([
    (0, common_1.Get)('stats/merchants'),
    __param(0, (0, common_1.Query)('from')),
    __param(1, (0, common_1.Query)('to')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ShipmentsController.prototype, "getMerchantStats", null);
__decorate([
    (0, common_1.Get)('batches'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ShipmentsController.prototype, "getBatches", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ShipmentsController.prototype, "findOne", null);
exports.ShipmentsController = ShipmentsController = __decorate([
    (0, common_1.Controller)('shipments'),
    __metadata("design:paramtypes", [shipments_service_1.ShipmentsService, shipments_analytics_1.ShipmentsAnalyticsService])
], ShipmentsController);
//# sourceMappingURL=shipments.controller.js.map