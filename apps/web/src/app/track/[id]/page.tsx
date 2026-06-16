import { fetchShipment } from '@/lib/api';
import { notFound } from 'next/navigation';

export default async function TrackPage({ params }: { params: { id: string } }) {
  let shipment;
  try {
    shipment = await fetchShipment(params.id);
  } catch {
    notFound();
  }
  if (!shipment) notFound();

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Shipment {shipment.orderId}</h1>
      <div className="border rounded p-4 space-y-2">
        <p><strong>Status:</strong> {shipment.status}</p>
        {shipment.failureReason && <p><strong>Reason:</strong> {shipment.failureReason}</p>}
        <p><strong>Address:</strong> {shipment.addressText}</p>
        <p><strong>Driver:</strong> {shipment.driver}</p>
        <p><strong>COD Amount:</strong> {shipment.codAmount} MAD</p>
        <p><strong>Attempted at:</strong> {shipment.attemptedAt ?? 'Not yet'}</p>
        {shipment.status === 'DELIVERED' && (
          <div className="bg-green-100 p-2 rounded mt-2">Delivered successfully</div>
        )}
      </div>
    </div>
  );
}