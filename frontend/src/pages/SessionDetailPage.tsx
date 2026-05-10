import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

const statusColors: Record<string, string> = {
  queued:     'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  completed:  'bg-green-100 text-green-800',
  failed:     'bg-red-100 text-red-800',
};

const SessionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const statusQuery = useQuery({
    queryKey: ['session-status', id],
    queryFn: () =>
      fetch(`/transcripts/${id}/status`, { headers: authHeader() }).then((r) => r.json()),
    refetchInterval: (query) => {
      const status = (query.state.data as any)?.status;
      return status === 'queued' || status === 'processing' ? 3000 : false;
    },
  });

  const reportQuery = useQuery({
    queryKey: ['session-report', id],
    queryFn: () =>
      fetch(`/transcripts/${id}/report`, { headers: authHeader() }).then((r) => r.json()),
    enabled: statusQuery.data?.status === 'completed',
  });

  const status = statusQuery.data?.status;

  return (
    <div className="px-4 py-6 sm:px-0">
      <Link to="/sessions" className="text-sm text-indigo-600 hover:underline">
        ← Back to Sessions
      </Link>

      {statusQuery.isLoading && <p className="mt-4 text-gray-500">Loading...</p>}

      {statusQuery.data && (
        <div className="mt-4 bg-white shadow sm:rounded-lg p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">{statusQuery.data.filename ?? `Session ${id}`}</h2>
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[status] ?? 'bg-gray-100 text-gray-800'}`}>
              {status}
            </span>
          </div>

          {(status === 'queued' || status === 'processing') && (
            <p className="mt-4 text-gray-500">Processing your transcript...</p>
          )}

          {status === 'failed' && (
            <div className="mt-4 p-4 bg-red-50 rounded-md">
              <p className="text-sm text-red-700">{statusQuery.data.error_message ?? 'Processing failed.'}</p>
            </div>
          )}
        </div>
      )}

      {reportQuery.data && (
        <>
          <div className="mt-6 bg-white shadow sm:rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Score Summary</h3>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {Object.entries(reportQuery.data.score_summary ?? {}).map(([key, value]) => (
                <div key={key} className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">{key.replace(/_/g, ' ')}</p>
                  <p className="mt-1 text-2xl font-bold text-indigo-600">
                    {typeof value === 'number' ? value.toFixed(1) : JSON.stringify(value)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {reportQuery.data.coaching_summary && (
            <div className="mt-6 bg-white shadow sm:rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Coaching Notes</h3>
              <p className="text-sm text-gray-700 whitespace-pre-line">{reportQuery.data.coaching_summary}</p>
            </div>
          )}

          {reportQuery.data.score_details && (
            <div className="mt-6 bg-white shadow sm:rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Score Details</h3>
              <dl className="space-y-2">
                {Object.entries(reportQuery.data.score_details ?? {}).map(([key, value]) => (
                  <div key={key} className="flex gap-2 text-sm">
                    <dt className="font-medium text-gray-600 capitalize">{key.replace(/_/g, ' ')}:</dt>
                    <dd className="text-gray-800">{typeof value === 'object' ? JSON.stringify(value) : String(value)}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SessionDetailPage;
