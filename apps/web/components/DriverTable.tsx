'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchDriverStats } from '@/lib/api';

type Props = {
  from: string;
  to: string;
};

const DriverTable = ({ from, to }: Props) => {
  const { data: drivers, isLoading } = useQuery({
    queryKey: ['driverStats', from, to],
    queryFn: () => fetchDriverStats(from, to),
  });

  if (isLoading) return <p>Loading driver stats...</p>;
  if (!drivers || drivers.length === 0) return <p>No driver data.</p>;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border text-black">
        <thead>
          <tr>
            <th className="px-4 py-2">Driver</th>
            <th className="px-4 py-2">Total</th>
            <th className="px-4 py-2">Delivered</th>
            <th className="px-4 py-2">Failed</th>
            <th className="px-4 py-2">Failure Rate</th>
            <th className="px-4 py-2">COD Missing</th>
          </tr>
        </thead>

        <tbody>
          {drivers.map((d) => (
            <tr key={d.driver} className="border-t hover:bg-gray-50">
              <td className="px-4 py-2">{d.driver}</td>
              <td className="px-4 py-2">{d.total}</td>
              <td className="px-4 py-2">{d.delivered}</td>
              <td className="px-4 py-2">{d.failed}</td>
              <td className="px-4 py-2">{d.failureRate}%</td>
              <td className="px-4 py-2">{d.codMissing}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DriverTable;