import { useParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import ReactMarkdown from 'react-markdown';
import api from '../services/api';

export default function SOPDetail() {
  const { id } = useParams();

  const { data: sop, isLoading } = useQuery(['sop', id], () =>
    api.get(`/sops/${id}`).then(res => res.data.data)
  );

  if (isLoading) {
    return <div className="text-center py-12">Loading SOP...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="card">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{sop?.title}</h1>
            <p className="mt-2 text-gray-600">{sop?.category} • Version {sop?.version}</p>
          </div>
          <span className={`px-3 py-1 rounded ${
            sop?.status === 'Published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
          }`}>
            {sop?.status}
          </span>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Purpose</h2>
          <p className="mt-2 text-gray-700">{sop?.purpose}</p>
        </div>

        {sop?.scope && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Scope</h2>
            <p className="mt-2 text-gray-700">{sop?.scope}</p>
          </div>
        )}

        <div className="mt-6 pt-6 border-t border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Content</h2>
          <div className="prose max-w-none">
            <ReactMarkdown>{sop?.content}</ReactMarkdown>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200 text-sm text-gray-500">
          <p>Owner: {sop?.Owner?.name}</p>
          <p>Last updated: {new Date(sop?.updatedAt).toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
}
