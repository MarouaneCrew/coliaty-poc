'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { API_URL, fetchShipments } from '@/lib/api';
import dynamic from 'next/dynamic';
import UploadForm from '@/components/UploadForm';
import DriverTable from '@/components/DriverTable';

const MapComponent = dynamic(() => import('@/components/MapComponent'), { ssr: false });

function KPI({ label, value }: any) {
  return (
    <div className="p-4 border rounded">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="text-xl font-bold">{value ?? 0}</div>
    </div>
  );
}

export default function DashboardPage() {
  const [statusFilter, setStatusFilter] = useState<string>('FAILED');
  const today = new Date();

  const defaultFrom = new Date(today);
  defaultFrom.setDate(today.getDate() - 30);

  const [fromDate, setFromDate] =
    useState(defaultFrom.toISOString().split('T')[0]);

  const [toDate, setToDate] =
    useState(today.toISOString().split('T')[0]);

  const { data: shipments, isLoading } = useQuery({
    queryKey: ['shipments', statusFilter, fromDate, toDate],

    queryFn: () =>
      fetchShipments({
        status: statusFilter,
        from: fromDate,
        to: toDate,
      }),
    refetchInterval: 15000,
  });

  // const { data: stats } = useQuery({
  //   queryKey: ['stats', fromDate, toDate],

  //   queryFn: () =>
  //     fetch(
  //       `${API_URL}/shipments/stats?from=${fromDate}&to=${toDate}`
  //     ).then(r => r.json()),
  // });

  const { data: stats } = useQuery({
    queryKey: ['stats', fromDate, toDate],
    queryFn: async () => {
      const res = await fetch(
        `${API_URL}/shipments/stats?from=${fromDate}&to=${toDate}`
      );
      const text = await res.text();
      return JSON.parse(text);
    },
  });

  const { data: failureReasons } = useQuery({
    queryKey: ['failureReasons', fromDate, toDate],

    queryFn: () =>
      fetch(
        `${API_URL}/shipments/stats/failure-reasons?from=${fromDate}&to=${toDate}`
      ).then(r => r.json()),
  });

  const { data: merchants } = useQuery({
    queryKey: ['merchant-stats', fromDate, toDate],

    queryFn: () =>
      fetch(
        `${API_URL}/shipments/stats/merchants?from=${fromDate}&to=${toDate}`
      ).then(r => r.json()),
  });

  const { data: batches } = useQuery({
    queryKey: ['batches'],
    queryFn: () =>
      fetch(`${API_URL}/shipments/batches`)
        .then(r => r.json()),
  });

  useEffect(() => {
    if (!stats) return;
  }, [stats]);

  return (
    <div className="p-4 space-y-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold">Delivery Command Center</h1>

      <div className="flex gap-4 items-center">

        <div>
          <label className="text-sm block">
            From
          </label>

          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="border p-2 rounded"
          />
        </div>

        <div>
          <label className="text-sm block">
            To
          </label>

          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="border p-2 rounded"
          />
        </div>

      </div>

      <UploadForm />

      {/* KPI SECTION (NOW CORRECTLY INSIDE RETURN) */}
      <div className="grid grid-cols-5 gap-4 mt-4">
        <KPI label="Total" value={stats?.total} />
        <KPI label="Delivered" value={stats?.delivered} />
        <KPI label="Failed" value={stats?.failed} />
        <KPI label="Out" value={stats?.outForDelivery} />
        <KPI label="COD" value={stats?.codTotal} />
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-3">
          Merchant Performance
        </h2>

        <table className="w-full border text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 text-black text-left">Merchant</th>
              <th className="p-2 text-black">Total</th>
              <th className="p-2 text-black">Delivered</th>
              <th className="p-2 text-black">Failed</th>
              <th className="p-2 text-black">Failure Rate</th>
            </tr>
          </thead>

          <tbody>
            {merchants?.map((m: any) => (
              <tr key={m.merchant} className="border-t">
                <td className="p-2 font-medium">{m.merchant}</td>
                <td className="p-2 text-center">{m.total}</td>
                <td className="p-2 text-center text-green-600">
                  {m.delivered}
                </td>
                <td className="p-2 text-center text-red-500">
                  {m.failed}
                </td>
                <td className="p-2 text-center">
                  {m.failureRate.toFixed(1)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* <div className="mt-10">
        <h2 className="text-xl font-semibold mb-3">
          Upload History
        </h2>

        <table className="w-full border text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 text-black text-left">File</th>
              <th className="p-2 text-black">Date</th>
              <th className="p-2 text-black">Total</th>
              <th className="p-2 text-black">Success</th>
              <th className="p-2 text-black">Failed</th>
              <th className="p-2 text-black">Status</th>
            </tr>
          </thead>

          <tbody>
            {batches?.map((b: any) => (
              <tr key={b.id} className="border-t">
                <td className="p-2">{b.fileName}</td>
                <td className="p-2">
                  {new Date(b.createdAt).toLocaleDateString()}
                </td>
                <td className="p-2 text-center">{b.totalRows}</td>
                <td className="p-2 text-center text-green-600">
                  {b.successRows}
                </td>
                <td className="p-2 text-center text-red-500">
                  {b.failedRows}
                </td>
                <td className="p-2 text-center">{b.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div> */}

      <div className="grid grid-cols-4 gap-4 mt-6">
        <div className="border rounded p-4">
          <div className="text-sm text-gray-500">
            Address Incorrect
          </div>
          <div className="text-2xl font-bold">
            {failureReasons?.ADDRESS_INCORRECT ?? 0}
          </div>
        </div>

        <div className="border rounded p-4">
          <div className="text-sm text-gray-500">
            Client Absent
          </div>
          <div className="text-2xl font-bold">
            {failureReasons?.CLIENT_ABSENT ?? 0}
          </div>
        </div>

        <div className="border rounded p-4">
          <div className="text-sm text-gray-500">
            COD Refused
          </div>
          <div className="text-2xl font-bold">
            {failureReasons?.COD_REFUSED ?? 0}
          </div>
        </div>

        <div className="border rounded p-4">
          <div className="text-sm text-gray-500">
            Other
          </div>
          <div className="text-2xl font-bold">
            {failureReasons?.OTHER ?? 0}
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border p-1"
        >
          <option value="">All</option>
          <option value="FAILED">Failed</option>
          <option value="DELIVERED">Delivered</option>
          <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
        </select>

        <span className="text-gray-500">
          Showing: {shipments?.length ?? 0} shipments
        </span>
      </div>

      {isLoading ? (
        <p>Loading map...</p>
      ) : (
        <MapComponent shipments={shipments ?? []} />
      )}

      <div>
        <h2 className="text-xl font-semibold mb-2">Driver Scorecard</h2>
        <DriverTable
          from={fromDate}
          to={toDate}
        />
      </div>
    </div>
  );
}