export declare class GeocodingService {
    private readonly logger;
    private geocoder;
    private queue;
    private processing;
    private lastCallTime;
    private readonly minIntervalMs;
    constructor();
    geocode(address: string): Promise<{
        lat: number;
        lng: number;
    } | null>;
    geocodeOnce(address: string): Promise<{
        lat: number;
        lng: number;
    } | null>;
    private processQueue;
    private sleep;
}
