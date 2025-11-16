'use client';

import { useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

interface Activity {
  id: string;
  type: 'reflection_submitted' | 'feedback_completed' | 'user_joined' | 'team_created' | 'ai_analysis_completed';
  title: string;
  description: string;
  timestamp: string;
  user?: {
    name: string;
    email: string;
  };
  metadata?: Record<string, any>;
}

export function RecentActivities() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await fetch('/api/admin/recent-activities');
        if (!response.ok) {
          throw new Error('활동 내역을 불러오는데 실패했습니다');
        }
        const data = await response.json();
        setActivities(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다');
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'reflection_submitted':
        return '📝';
      case 'feedback_completed':
        return '✅';
      case 'user_joined':
        return '👋';
      case 'team_created':
        return '🏆';
      case 'ai_analysis_completed':
        return '🤖';
      default:
        return '📋';
    }
  };

  const getActivityColor = (type: Activity['type']) => {
    switch (type) {
      case 'reflection_submitted':
        return 'text-blue-600 bg-blue-50';
      case 'feedback_completed':
        return 'text-green-600 bg-green-50';
      case 'user_joined':
        return 'text-purple-600 bg-purple-50';
      case 'team_created':
        return 'text-orange-600 bg-orange-50';
      case 'ai_analysis_completed':
        return 'text-indigo-600 bg-indigo-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { 
        addSuffix: true, 
        locale: ko 
      });
    } catch {
      return '방금 전';
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-4">
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-2">📊</div>
        <p className="text-sm text-gray-600">최근 7일간 활동이 없습니다</p>
        <p className="text-xs text-gray-500 mt-1">
          리플렉션 제출, 사용자 가입 등의 활동이 여기에 표시됩니다
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div key={activity.id} className="flex items-start space-x-3">
          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm ${getActivityColor(activity.type)}`}>
            {getActivityIcon(activity.type)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-900">
                {activity.title}
              </p>
              <p className="text-xs text-gray-500 flex-shrink-0 ml-2">
                {formatTimeAgo(activity.timestamp)}
              </p>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {activity.description}
            </p>
            {activity.user && (
              <p className="text-xs text-gray-500 mt-1">
                {activity.user.email}
              </p>
            )}
          </div>
        </div>
      ))}
      
      {activities.length >= 10 && (
        <div className="text-center pt-2 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            최근 10개 활동만 표시됩니다
          </p>
        </div>
      )}
    </div>
  );
}