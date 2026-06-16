export interface Shipment {
    id: string;
    orderId: string;
    merchant: string;
    addressText: string;
    lat: number | null;
    lng: number | null;
    customerPhone: string | null;
    driver: string;
    status: 'PENDING' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'FAILED';
    failureReason: 'ADDRESS_INCORRECT' | 'CLIENT_ABSENT' | 'COD_REFUSED' | 'OTHER' | null;
    codAmount: number | null;
    attemptedAt: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface DriverStats {
    driver: string;
    total: number;
    delivered: number;
    failed: number;
    failureRate: string;
    reasons: Record<string, number>;
    codMissing: number;
}