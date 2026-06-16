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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var GeocodingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeocodingService = void 0;
const common_1 = require("@nestjs/common");
const node_geocoder_1 = __importDefault(require("node-geocoder"));
let GeocodingService = GeocodingService_1 = class GeocodingService {
    logger = new common_1.Logger(GeocodingService_1.name);
    geocoder;
    queue = [];
    processing = false;
    lastCallTime = 0;
    minIntervalMs = 1100;
    constructor() {
        this.geocoder = (0, node_geocoder_1.default)({
            provider: 'openstreetmap',
            userAgent: 'ColiatyPOC',
            email: 'demo@coliaty.com',
            language: 'ar',
            countrycodes: 'ma',
        });
    }
    geocode(address) {
        return new Promise((resolve) => {
            this.queue.push(async () => {
                try {
                    const res = await this.geocodeOnce(address);
                    resolve(res);
                }
                catch (err) {
                    const message = err instanceof Error ? err.message : String(err);
                    this.logger.error(`Geocode failed: ${message}`);
                    resolve(null);
                }
            });
            this.processQueue();
        });
    }
    async geocodeOnce(address) {
        const results = await this.geocoder.geocode(address);
        if (!results.length)
            return null;
        const r = results[0];
        if (!r.latitude || !r.longitude)
            return null;
        return {
            lat: r.latitude,
            lng: r.longitude,
        };
    }
    async processQueue() {
        if (this.processing)
            return;
        this.processing = true;
        while (this.queue.length > 0) {
            const now = Date.now();
            const timeSinceLastCall = now - this.lastCallTime;
            if (timeSinceLastCall < this.minIntervalMs) {
                await this.sleep(this.minIntervalMs - timeSinceLastCall);
            }
            const task = this.queue.shift();
            if (task) {
                await task();
                this.lastCallTime = Date.now();
            }
        }
        this.processing = false;
    }
    sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
};
exports.GeocodingService = GeocodingService;
exports.GeocodingService = GeocodingService = GeocodingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], GeocodingService);
//# sourceMappingURL=geocoding.service.js.map