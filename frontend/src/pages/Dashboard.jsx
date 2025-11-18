import { useAuthStore } from '../store/authStore';
import { useQuery } from 'react-query';
import api from '../services/api';

export default function Dashboard() {
  const { user } = useAuthStore();
  
  const { data: progressData } = useQuery('onboarding-progress', () =>
    api.get('/onboarding/progress').then(res => res.data.data)
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-gray-600">Welcome back, {user?.name}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900">Onboarding Status</h3>
          <p className="mt-2 text-3xl font-bold text-primary-600">{user?.onboardingStatus}</p>
        </div>
        
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900">Tasks Completed</h3>
          <p className="mt-2 text-3xl font-bold text-green-600">
            {progressData?.stats?.find(s => s.status === 'Completed')?.count || 0}
          </p>
        </div>
        
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900">Role</h3>
          <p className="mt-2 text-2xl font-bold text-gray-700">{user?.role}</p>
        </div>
      </div>

      {user?.onboardingStatus !== 'Completed' && (
        <div className="card bg-primary-50 border-primary-200">
          <h3 className="text-lg font-semibold text-primary-900">Continue Your Onboarding</h3>
          <p className="mt-2 text-primary-700">You have pending onboarding tasks to complete.</p>
          <a href="/onboarding" className="mt-4 inline-block btn-primary">View Onboarding</a>
        </div>
      )}
    </div>
  );
}
