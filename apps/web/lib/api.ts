import axios from 'axios';
import { Shipment, DriverStats } from './types';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
});

export const uploadCsv = async (file: File) => {
    const form = new FormData();
    form.append('file', file);
    const { data } = await api.post<{ count: number; }>('/shipments/upload', form);
    return data;
};

export const fetchShipments = async (filters?: { status?: string; driver?: string; }) => {
    const params = new URLSearchParams(filters);
    const { data } = await api.get<Shipment[]>('/shipments', { params });
    return data;
};

export const fetchShipment = async (id: string) => {
    const { data } = await api.get<Shipment>(`/shipments/${id}`);
    return data;
};

export const fetchDriverStats = async (date?: string) => {
    const params = new URLSearchParams();
    if (date) params.append('date', date);
    const { data } = await api.get<DriverStats[]>('/drivers/stats', { params });
    return data;
};

export async function fetchDailyStats(date: string) {
    const res = await fetch(
        `http://localhost:3001/shipments/stats/daily?date=${date}`,
    );

    if (!res.ok) throw new Error('Failed to fetch stats');

    return res.json();
}