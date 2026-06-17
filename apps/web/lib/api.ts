import axios from 'axios';
import { Shipment, DriverStats } from './types';

export const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
});

export const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const uploadCsv = async (file: File) => {
    const form = new FormData();
    form.append('file', file);
    const { data } = await api.post<{ count: number; }>('/shipments/upload', form);
    return data;
};

export const fetchShipments = async (
    filters?: {
        status?: string;
        driver?: string;
        from?: string;
        to?: string;
    }
) => {
    const params = new URLSearchParams(filters);
    const { data } = await api.get<Shipment[]>('/shipments', { params });
    return data;
};

export const fetchShipment = async (id: string) => {
    const { data } = await api.get<Shipment>(`/shipments/${id}`);
    return data;
};

export const fetchDriverStats = async (
    from?: string,
    to?: string
) => {
    const params = new URLSearchParams();

    if (from) params.append('from', from);
    if (to) params.append('to', to);

    const { data } = await api.get<DriverStats[]>(
        '/drivers/stats',
        { params }
    );

    return data;
};

export async function fetchStats(
    from?: string,
    to?: string,
) {
    const params = new URLSearchParams();

    if (from) params.append('from', from);
    if (to) params.append('to', to);

    const res = await fetch(
        `${API_URL}/shipments/stats?${params}`
    );

    if (!res.ok)
        throw new Error('Failed to fetch stats');

    return res.json();
}