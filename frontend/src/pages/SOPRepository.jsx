import { useState } from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline';

export default function SOPRepository() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  const { data, isLoading } = useQuery(['sops', search, category], () =>
    api.get('/sops', { params: { search, category } }).then(res => res.data)
  );

  const categories = ['TechnicalSEO', 'Content', 'LinkBuilding', 'Analytics', 'ToolAccess', 'General'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">SOP Repository</h1>
      </div>

      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search SOPs..."
              className="input pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-gray-600">Loading SOPs...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data?.data?.map((sop) => (
            <Link key={sop.id} to={`/repository/${sop.id}`} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <h3 className="text-lg font-semibold text-gray-900">{sop.title}</h3>
                <span className={`px-2 py-1 text-xs rounded ${
                  sop.status === 'Published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                }`}>
                  {sop.status}
                </span>
              </div>
              <p className="mt-2 text-sm text-gray-600 line-clamp-2">{sop.purpose}</p>
              <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                <span>{sop.category}</span>
                <span>v{sop.version}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
