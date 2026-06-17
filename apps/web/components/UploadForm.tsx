'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { uploadCsv } from '@/lib/api';

type ApiError = {
  response?: {
    data?: {
      error?: string;
      message?: string;
      missingColumns?: string[];
      extraColumns?: string[];
    };
  };
};

const UploadForm = () => {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: uploadCsv,

    onSuccess: () => {
      setError(null);

      queryClient.invalidateQueries({ queryKey: ['shipments'] });
      queryClient.invalidateQueries({ queryKey: ['driverStats'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      queryClient.invalidateQueries({ queryKey: ['failureReasons'] });

      alert('CSV uploaded and processed!');
    },

    onError: (err: ApiError) => {
      const data = err?.response?.data;

      if (data?.error === 'INVALID_FILE_SCHEMA') {
        const missing = data.missingColumns?.length
          ? `Missing: ${data.missingColumns.join(', ')}`
          : '';

        const extra = data.extraColumns?.length
          ? `Extra: ${data.extraColumns.join(', ')}`
          : '';

        setError(
          `${data.message || 'Invalid file schema'}\n${missing}\n${extra}`,
        );
      } else {
        setError(data?.message || 'Upload failed');
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    setError(null);

    if (!file) return;

    mutation.mutate(file);
  };

  return (
    <div className="space-y-2">
      <form onSubmit={handleSubmit} className="flex gap-2 items-center">
        <input
          type="file"
          accept=".csv"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="border p-1"
          required
        />

        <button
          type="submit"
          disabled={mutation.isPending}
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:bg-gray-400"
        >
          {mutation.isPending ? 'Processing...' : 'Upload CSV'}
        </button>
      </form>

      {error && (
        <div className="text-red-600 text-sm whitespace-pre-line">
          {error}
        </div>
      )}
    </div>
  );
};

export default UploadForm;