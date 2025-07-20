import React from 'react';
import { ReviewStats } from '../hooks/useReviewStats';

interface Props {
  stats: ReviewStats;
}

const StatsSidebar: React.FC<Props> = ({ stats }) => (
  <aside className="space-y-4">
    <div className="p-4 rounded-lg bg-white dark:bg-gray-800">
      <p className="text-sm text-gray-500 dark:text-gray-400">Racha activa</p>
      <p className="text-2xl font-semibold">{stats.streak} días</p>
    </div>
    <div className="p-4 rounded-lg bg-white dark:bg-gray-800">
      <p className="text-sm text-gray-500 dark:text-gray-400">Mejor racha</p>
      <p className="text-2xl font-semibold">{stats.maxStreak} días</p>
    </div>
    <div className="p-4 rounded-lg bg-white dark:bg-gray-800">
      <p className="text-sm text-gray-500 dark:text-gray-400">Total repasos</p>
      <p className="text-2xl font-semibold">{stats.totalReviews}</p>
    </div>
    <div className="p-4 rounded-lg bg-white dark:bg-gray-800">
      <p className="text-sm text-gray-500 dark:text-gray-400">Exactitud promedio</p>
      <p className="text-2xl font-semibold">{stats.averageAccuracy.toFixed(1)}%</p>
    </div>
  </aside>
);

export default StatsSidebar;
