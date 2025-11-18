import { useQuery, useMutation, useQueryClient } from 'react-query';
import api from '../services/api';
import toast from 'react-hot-toast';
import { CheckCircleIcon, ClockIcon } from '@heroicons/react/24/outline';

export default function OnboardingDashboard() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery('onboarding-progress', () =>
    api.get('/onboarding/progress').then(res => res.data.data)
  );

  const updateTaskMutation = useMutation(
    ({ taskId, status }) => api.put(`/onboarding/tasks/${taskId}`, { status }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('onboarding-progress');
        toast.success('Task updated successfully');
      }
    }
  );

  const handleTaskUpdate = (taskId, currentStatus) => {
    const newStatus = currentStatus === 'Completed' ? 'NotStarted' : 'Completed';
    updateTaskMutation.mutate({ taskId, status: newStatus });
  };

  if (isLoading) return <div className="text-center py-12">Loading...</div>;

  const totalTasks = data?.modules?.reduce((acc, m) => acc + m.Tasks.length, 0) || 0;
  const completedTasks = data?.stats?.find(s => s.status === 'Completed')?.count || 0;
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Onboarding Progress</h1>
        <p className="mt-1 text-gray-600">Track your onboarding journey</p>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Overall Progress</span>
          <span className="text-sm font-medium text-primary-600">{progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-primary-600 h-2 rounded-full transition-all" style={{ width: `${progress}%` }} />
        </div>
        <p className="mt-2 text-sm text-gray-600">{completedTasks} of {totalTasks} tasks completed</p>
      </div>

      <div className="space-y-6">
        {data?.modules?.map((module) => (
          <div key={module.id} className="card">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{module.title}</h2>
                <p className="text-sm text-gray-600">{module.phase} • {module.Tasks.length} tasks</p>
              </div>
              <span className={`px-2 py-1 text-xs rounded ${
                module.isRequired ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
              }`}>
                {module.isRequired ? 'Required' : 'Optional'}
              </span>
            </div>

            <div className="mt-4 space-y-3">
              {module.Tasks.map((task) => {
                const taskProgress = task.Progress?.[0];
                const isCompleted = taskProgress?.status === 'Completed';

                return (
                  <div
                    key={task.id}
                    className="flex items-center p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
                    onClick={() => handleTaskUpdate(task.id, taskProgress?.status)}
                  >
                    <div className="flex-shrink-0 mr-3">
                      {isCompleted ? (
                        <CheckCircleIcon className="w-6 h-6 text-green-500" />
                      ) : (
                        <ClockIcon className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className={`text-sm font-medium ${isCompleted ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                        {task.title}
                      </h3>
                      {task.description && (
                        <p className="text-xs text-gray-600 mt-1">{task.description}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
