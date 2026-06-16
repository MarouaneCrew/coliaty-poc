'use client';

import { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import { Shipment } from '@/lib/types';

/**
 * Fix Leaflet default icon in Next.js
 * (safe + stable approach)
 */
delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface MapComponentProps {
  shipments: Shipment[];
}

const createIcon = (color: string) =>
  L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      background-color:${color};
      width:14px;
      height:14px;
      border-radius:50%;
      border:2px solid white;
    "></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });

const failureColors: Record<string, string> = {
  ADDRESS_INCORRECT: '#f97316', // orange
  CLIENT_ABSENT: '#ef4444',     // red
  COD_REFUSED: '#8b5cf6',       // purple
  OTHER: '#6b7280',             // gray
};

const getMarkerColor = (shipment: Shipment) => {
  if (shipment.status === 'FAILED' && shipment.failureReason) {
    return failureColors[shipment.failureReason] || failureColors.OTHER;
  }
  return '#22c55e'; // green for non-failed (DELIVERED + OUT_FOR_DELIVERY)
};

export default function MapComponent({ shipments }: MapComponentProps) {
  // Casablanca center
  const center: [number, number] = [33.5731, -7.5898];

  /**
   * Keep only valid coordinates
   * IMPORTANT: use null checks, NOT truthy checks
   */
  const geocodedShipments = useMemo(() => {
    return shipments.filter(
      (s) => s.lat !== null && s.lng !== null
    );
  }, [shipments]);

  return (
    <MapContainer
      center={center}
      zoom={12}
      style={{ height: '500px', width: '100%' }}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {geocodedShipments.map((shipment) => {
        const lat = Number(shipment.lat);
        const lng = Number(shipment.lng);

        if (Number.isNaN(lat) || Number.isNaN(lng)) return null;

        return (
          <Marker key={shipment.id} position={[lat, lng]} icon={createIcon(getMarkerColor(shipment))}>
            <Popup>
              <div style={{ fontSize: '12px' }}>
                <strong>{shipment.orderId}</strong>
                <br />
                {shipment.addressText}
                <br />
                Driver: {shipment.driver}
                <br />
                Status: {shipment.status}
                {shipment.failureReason
                  ? ` - ${shipment.failureReason}`
                  : ''}
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}