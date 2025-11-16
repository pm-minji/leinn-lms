'use client';

interface LearningProgressProps {
  reflections: any[];
  learner: any;
}

export function LearningProgress({ reflections, learner }: LearningProgressProps) {
  // Calculate learning metrics
  const totalReflections = reflections.length;
  const thisWeekReflections = reflections.filter(r => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return new Date(r.created_at) > weekAgo;
  }).length;

  const completedReflections = reflections.filter(r => r.status === 'coach_feedback_done').length;
  const pendingReflections = reflections.filter(r => r.status !== 'coach_feedback_done').length;

  const completionRate = totalReflections > 0 ? Math.round((completedReflections / totalReflections) * 100) : 0;

  // Calculate streak (consecutive weeks with reflections)
  const getWeekStreak = () => {
    if (reflections.length === 0) return 0;
    
    const weeks = new Set();
    reflections.forEach(r => {
      const date = new Date(r.week_start);
      const weekKey = `${date.getFullYear()}-${Math.floor(date.getTime() / (7 * 24 * 60 * 60 * 1000))}`;
      weeks.add(weekKey);
    });
    
    return weeks.size;
  };

  const weekStreak = getWeekStreak();

  const progressMetrics = [
    {
      label: '총 리플렉션',
      value: totalReflections,
      icon: '📝',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      label: '이번 주 작성',
      value: thisWeekReflections,
      icon: '🔥',
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    },
    {
      label: '완료된 피드백',
      value: completedReflections,
      icon: '✅',
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      label: '학습 연속 주차',
      value: weekStreak,
      icon: '🏃‍♂️',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    }
  ];

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">📈 학습 진행 현황</h2>
        <div className="text-right">
          <p className="text-xs text-gray-500">완료율</p>
          <p className="text-lg font-bold text-gray-900">{completionRate}%</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {progressMetrics.map((metric, index) => (
          <div key={index} className="text-center">
            <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${metric.bgColor} mb-2`}>
              <span className="text-lg">{metric.icon}</span>
            </div>
            <p className={`text-2xl font-bold ${metric.color}`}>{metric.value}</p>
            <p className="text-xs text-gray-600">{metric.label}</p>
          </div>
        ))}
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">학습 완료도</span>
          <span className="text-sm text-gray-500">{completedReflections}/{totalReflections}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${completionRate}%` }}
          ></div>
        </div>
      </div>

      {/* Learning Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-2">🎯 이번 주 목표</h4>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• 리플렉션 1개 이상 작성하기</li>
            <li>• 팀원들과 학습 경험 공유하기</li>
            <li>• 코치 피드백 적극 활용하기</li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-2">📊 학습 통계</h4>
          <div className="text-xs text-gray-600 space-y-1">
            <div className="flex justify-between">
              <span>평균 주간 리플렉션:</span>
              <span className="font-medium">{weekStreak > 0 ? (totalReflections / weekStreak).toFixed(1) : 0}개</span>
            </div>
            <div className="flex justify-between">
              <span>대기 중인 피드백:</span>
              <span className="font-medium">{pendingReflections}개</span>
            </div>
            <div className="flex justify-between">
              <span>학습 시작일:</span>
              <span className="font-medium">
                {learner.joined_at ? new Date(learner.joined_at).toLocaleDateString('ko-KR') : '-'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}