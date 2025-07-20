import React from 'react';

export interface StatsSidebarProps {
  data: { date: Date; reviews: number; accuracy?: number }[];
}

/** Calcula el streak actual y máximo. */
export const getStreak = (data: { date: Date; reviews: number }[]) => {
  const sorted = [...data].sort((a, b) => a.date.getTime() - b.date.getTime());
  let current = 0;
  let max = 0;
  let prev: Date | null = null;
  for (const d of sorted) {
    if (prev && Math.floor((d.date.getTime() - prev.getTime()) / 86400000) === 1) {
      current++;
    } else if (!prev || d.date.getTime() - prev.getTime() > 86400000) {
      current = 1;
    }
    max = Math.max(max, current);
    prev = d.date;
  }
  const lastDate = sorted[sorted.length - 1];
  const today = new Date();
  if (!lastDate || Math.floor((today.getTime() - lastDate.date.getTime()) / 86400000) > 1) {
    current = 0;
  }
  return { current, max };
};

/** Barra lateral con métricas de estudio. */
export const StatsSidebar: React.FC<StatsSidebarProps> = ({ data }) => {
  const { current, max } = getStreak(data);
  const total = data.reduce((s, d) => s + d.reviews, 0);
  const accuracies = data.map((d) => d.accuracy).filter((v): v is number => typeof v === 'number');
  const accuracy = accuracies.length ? accuracies.reduce((s, a) => s + a, 0) / accuracies.length : undefined;

  return (
    <aside className="p-4 space-y-2" aria-label="Estadísticas de estudio">
      <div>Racha actual: {current} días</div>
      <div>Racha máxima: {max} días</div>
      <div>Total repasos: {total}</div>
      {typeof accuracy === 'number' && <div>Exactitud promedio: {accuracy.toFixed(1)}%</div>}
    </aside>
  );
};

export default StatsSidebar;
