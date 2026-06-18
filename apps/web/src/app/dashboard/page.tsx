'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { API_URL, fetchShipments } from '@/lib/api';
import dynamic from 'next/dynamic';

import UploadForm from '@/components/UploadForm';
import DriverTable from '@/components/DriverTable';

const MapComponent = dynamic(
  () => import('@/components/MapComponent'),
  { ssr: false }
);

/* -------------------- Helpers -------------------- */

const statusLabels: Record<string, string> = {
  PENDING: 'En attente',
  OUT_FOR_DELIVERY: 'En livraison',
  DELIVERED: 'Livré',
  FAILED: 'Échec',
};

const statusStyles: Record<string, string> = {
  PENDING: 'bg-gray-100 text-gray-700',
  OUT_FOR_DELIVERY: 'bg-blue-100 text-blue-700',
  DELIVERED: 'bg-green-100 text-green-700',
  FAILED: 'bg-red-100 text-red-700',
};

const failureLabels: Record<string, string> = {
  ADDRESS_INCORRECT: 'Adresse incorrecte',
  CLIENT_ABSENT: 'Client absent',
  COD_REFUSED: 'Refus COD',
  OTHER: 'Autre',
};

const formatDH = (value?: number | null) =>
  `${value ?? 0} DH`;

/* -------------------- KPI -------------------- */

function KPI({
  label,
  value,
  description,
}: {
  label: string;
  value: any;
  description?: string;
}) {
  return (
    <div className="p-4 border rounded bg-white">
      <div className="text-sm text-white">{label}</div>
      <div className="text-xl font-bold">{value}</div>
      {description && (
        <div className="text-xs text-gray-400 mt-1">
          {description}
        </div>
      )}
    </div>
  );
}

/* -------------------- Page -------------------- */

export default function DashboardPage() {
  const [statusFilter, setStatusFilter] = useState('');

  const today = new Date();
  const defaultFrom = new Date(today);
  defaultFrom.setDate(today.getDate() - 30);

  const [fromDate, setFromDate] = useState(
    defaultFrom.toISOString().split('T')[0]
  );
  const [toDate, setToDate] = useState(
    today.toISOString().split('T')[0]
  );

  /* -------------------- Shipments -------------------- */

  const { data: shipments, isLoading } = useQuery({
    queryKey: [
      'shipments',
      statusFilter,
      fromDate,
      toDate,
    ],
    queryFn: () =>
      fetchShipments({
        status: statusFilter,
        from: fromDate,
        to: toDate,
      }),
    refetchInterval: 15000,
  });

  /* -------------------- Stats -------------------- */

  const { data: stats } = useQuery({
    queryKey: ['stats', fromDate, toDate],
    queryFn: async () => {
      const res = await fetch(
        `${API_URL}/shipments/stats?from=${fromDate}&to=${toDate}`
      );
      return res.json();
    },
  });

  /* -------------------- Failure Reasons -------------------- */

  const { data: failureReasons } = useQuery({
    queryKey: ['failureReasons', fromDate, toDate],
    queryFn: () =>
      fetch(
        `${API_URL}/shipments/stats/failure-reasons?from=${fromDate}&to=${toDate}`
      ).then((r) => r.json()),
  });

  /* -------------------- Merchants -------------------- */

  const { data: merchants } = useQuery({
    queryKey: ['merchant-stats', fromDate, toDate],
    queryFn: () =>
      fetch(
        `${API_URL}/shipments/stats/merchants?from=${fromDate}&to=${toDate}`
      ).then((r) => r.json()),
  });

  /* -------------------- Batches -------------------- */

  const { data: batches } = useQuery({
    queryKey: ['batches'],
    queryFn: () =>
      fetch(`${API_URL}/shipments/batches`).then((r) =>
        r.json()
      ),
  });

  const successRate = stats?.total
    ? (stats.delivered / stats.total) * 100
    : 0;


  /* -------------------- UI -------------------- */

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold">
          Centre de Pilotage des Livraisons
        </h1>
        <p className="text-white mt-1">
          Suivi en temps réel des expéditions, performances
          des chauffeurs et encaissements COD.
        </p>
      </div>

      {/* DATE FILTERS */}
      <div className="flex gap-4 items-center">
        <div>
          <label className="text-sm">Du</label>
          <input
            type="date"
            className="border p-2 rounded block"
            value={fromDate}
            onChange={(e) =>
              setFromDate(e.target.value)
            }
          />
        </div>

        <div>
          <label className="text-sm">Au</label>
          <input
            type="date"
            className="border p-2 rounded block"
            value={toDate}
            onChange={(e) =>
              setToDate(e.target.value)
            }
          />
        </div>
      </div>

      {/* UPLOAD */}
      <UploadForm />

      {/* KPIS */}
      <div>
        <h2 className="text-xl font-semibold text-white">
          Vue d'ensemble
        </h2>

        <p className="text-sm text-white mb-4">
          Indicateurs clés des livraisons sur la période sélectionnée.
        </p>

        <div className="grid grid-cols-5 gap-4">
          {/* TOTAL */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
            <div className="text-xs text-gray-400">
              Total expéditions
            </div>
            <div className="text-2xl font-bold text-white">
              {stats?.total}
            </div>
          </div>

          {/* DELIVERED */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
            <div className="text-xs text-green-400">
              Livrées
            </div>
            <div className="text-2xl font-bold text-green-300">
              {stats?.delivered}
            </div>
          </div>

          {/* FAILED */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
            <div className="text-xs text-red-400">
              Échouées
            </div>
            <div className="text-2xl font-bold text-red-300">
              {stats?.failed}
            </div>
          </div>

          {/* SUCCESS RATE */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
            <div className="text-xs text-blue-400">
              Taux de livraison
            </div>
            <div className="text-2xl font-bold text-blue-300">
              {successRate.toFixed(1)}%
            </div>
          </div>

          {/* COD */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
            <div className="text-xs text-emerald-400">
              COD total
            </div>
            <div className="text-2xl font-bold text-emerald-300">
              {formatDH(stats?.codTotal)}
            </div>
          </div>
        </div>
      </div>

      {/* FAILURE REASONS */}
      <div>
        <h2 className="text-xl font-semibold">
          Causes des échecs
        </h2>
        <p className="text-sm text-white mb-3">
          Répartition des motifs d’échec pour analyse
          opérationnelle.
        </p>

        <div className="grid grid-cols-4 gap-4">
          {Object.entries(failureLabels).map(
            ([key, label]) => (
              <div
                key={key}
                className="border rounded p-4"
              >
                <div className="text-sm text-white">
                  {label}
                </div>
                <div className="text-2xl font-bold">
                  {failureReasons?.[key] ?? 0}
                </div>
              </div>
            )
          )}
        </div>
      </div>

      {/* MERCHANTS */}
      <div>
        <h2 className="text-xl font-semibold">
          Performance des marchands
        </h2>

        <table className="w-full border text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 text-left text-black">
                Marchand
              </th>
              <th className='text-black'>Total</th>
              <th className='text-black'>Livrées</th>
              <th className='text-black'>Échouées</th>
              <th className='text-black'>Taux d’échec</th>
            </tr>
          </thead>

          <tbody>
            {merchants?.map((m: any) => (
              <tr key={m.merchant} className="border-t">
                <td className="p-2 font-medium">
                  {m.merchant}
                </td>
                <td className="text-center">
                  {m.total}
                </td>
                <td className="text-center text-green-600">
                  {m.delivered}
                </td>
                <td className="text-center text-red-500">
                  {m.failed}
                </td>
                <td className="text-center">
                  {m.failureRate.toFixed(1)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* FILTER + COUNT */}
      <div className="flex gap-4 items-center">
        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value)
          }
          className="border p-2 bg-white text-black"
        >
          <option value="">Tous</option>
          <option value="FAILED">Échecs</option>
          <option value="DELIVERED">Livrés</option>
          <option value="OUT_FOR_DELIVERY">
            En livraison
          </option>
        </select>

        <span className="text-white">
          {shipments?.length ?? 0} expéditions
        </span>
      </div>

      {/* MAP */}
      {isLoading ? (
        <p>Chargement de la carte...</p>
      ) : (
        <MapComponent
          shipments={shipments ?? []}
        />
      )}

      {/* SHIPMENTS TABLE */}
      <div>
        <h2 className="text-xl font-semibold mb-2">
          Expéditions récentes
        </h2>
        <p className="text-sm text-white mb-3">
          Liste des dernières livraisons avec accès au suivi
          détaillé.
        </p>

        <div className="overflow-x-auto border rounded">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 text-black text-left">Commande</th>
                <th className="p-2 text-black text-left">Marchand</th>
                <th className="p-2 text-black text-left">Chauffeur</th>
                <th className="p-2 text-black text-left">Statut</th>
                <th className="p-2 text-black text-left">COD</th>
                <th className="p-2 text-black text-left">Action</th>
              </tr>
            </thead>

            <tbody>
              {shipments?.map((s: any) => (
                <tr
                  key={s.id}
                  className="border-t"
                >
                  <td className="p-2">
                    {s.orderId}
                  </td>
                  <td>{s.merchant}</td>
                  <td>{s.driver}</td>

                  <td>
                    <span
                      className={`px-2 py-1 rounded ${statusStyles[s.status]
                        }`}
                    >
                      {statusLabels[s.status]}
                    </span>
                  </td>

                  <td>
                    {formatDH(s.codAmount)}
                  </td>

                  <td>
                    <Link
                      href={`/track/${s.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      Consulter
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* DRIVER SCORECARD */}
      <div>
        <h2 className="text-xl font-semibold">
          Performance des chauffeurs
        </h2>
        <p className="text-sm text-white mb-3">
          Classement des chauffeurs selon leurs résultats de
          livraison.
        </p>

        <DriverTable
          from={fromDate}
          to={toDate}
        />
      </div>

      {/* UPLOAD HISTORY */}
      <div>
        <h2 className="text-xl font-semibold">
          Historique des imports
        </h2>

        <table className="w-full border text-sm mt-2">
          <thead className="bg-gray-100">
            <tr>
              <th className='text-black py-2 text-left'>Fichier</th>
              <th className='text-black py-2 text-left'>Total</th>
              <th className='text-black py-2 text-left'>Succès</th>
              <th className='text-black py-2 text-left'>Échecs</th>
              <th className='text-black py-2 text-left'>Statut</th>
            </tr>
          </thead>

          <tbody>
            {batches?.map((b: any) => (
              <tr key={b.id}>
                <td className="p-2">
                  {b.fileName}
                </td>
                <td>{b.totalRows}</td>
                <td className="text-green-600">
                  {b.successRows}
                </td>
                <td className="text-red-600">
                  {b.failedRows}
                </td>
                <td>{b.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}