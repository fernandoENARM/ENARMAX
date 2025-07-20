import React from 'react';
import { CheckCircleIcon } from '@heroicons/react/solid';

function timeAgo(date) {
  const diff = Math.floor((Date.now() - new Date(date)) / 1000);
  const minutes = Math.floor(diff / 60);
  const hours = Math.floor(minutes / 60);
  if (hours > 0) return `hace ${hours}h`;
  if (minutes > 0) return `hace ${minutes}m`;
  return 'recién';
}

const RecentActivityCard = ({ title, type, completedAt }) => (
  <div className="h-56 rounded-2xl shadow-xl text-white p-6 flex flex-col justify-between" style={{background: 'radial-gradient(circle, var(--tw-gradient-stops))', '--tw-gradient-from': 'rgb(79 70 229)', '--tw-gradient-to': 'rgb(55 48 163)'}}>
    <div>
      <h3 className="text-xl font-semibold">{title}</h3>
      <p className="text-sm opacity-90">{type}</p>
    </div>
    <div className="space-y-4">
      <span className="inline-flex items-center text-sm bg-green-500 bg-opacity-20 text-green-200 px-3 py-1 rounded-full">
        <CheckCircleIcon className="w-4 h-4 mr-1" />
        Completado: {timeAgo(completedAt)}
      </span>
      <button className="w-full py-2 rounded-lg bg-indigo-500 hover:bg-indigo-400 transition-colors">Continuar</button>
    </div>
  </div>
);

export default RecentActivityCard;
