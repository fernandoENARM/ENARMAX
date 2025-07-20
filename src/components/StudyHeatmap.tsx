import React from 'react';
import { ResponsiveCalendarHeatmap, CalendarDatum } from 'react-calendar-heatmap';

export interface StudyHeatmapProps {
  data: { date: string | Date; reviews: number; accuracy?: number }[];
  startDate?: Date;
  endDate?: Date;
  onCellClick?: (d: { date: Date; reviews: number }) => void;
}

const colorScale = (v: number, dark?: boolean) => {
  if (v === 0) return dark ? '#e0e7ff' : '#e5f9ef';
  if (v <= 5) return dark ? '#a5b4fc' : '#a7f3d0';
  if (v <= 10) return dark ? '#6366f1' : '#34d399';
  return dark ? '#4338ca' : '#059669';
};

/**
 * Heatmap de actividad de estudio tipo GitHub.
 * @param props {@link StudyHeatmapProps}
 */
export const StudyHeatmap: React.FC<StudyHeatmapProps> = ({
  data,
  startDate = new Date(Date.now() - 364 * 24 * 60 * 60 * 1000),
  endDate = new Date(),
  onCellClick,
}) => {
  const values: CalendarDatum[] = data.map((d) => ({
    date: typeof d.date === 'string' ? d.date : d.date.toISOString().split('T')[0],
    count: d.reviews,
    accuracy: d.accuracy,
  }));

  return (
    <ResponsiveCalendarHeatmap
      data={values}
      from={startDate.toISOString().split('T')[0]}
      to={endDate.toISOString().split('T')[0]}
      emptyColor={colorScale(0)}
      colors={[colorScale(1), colorScale(6), colorScale(11)]}
      width="100%"
      height={140}
      gutterSize={4}
      tooltip={(d) =>
        `${d.count} repasos el ${new Date(d.date).toLocaleDateString()}${
          typeof d.accuracy === 'number' ? `\n${d.accuracy.toFixed(0)}% acierto` : ''
        }`
      }
      onClick={(d) => onCellClick?.({ date: new Date(d.date), reviews: d.count })}
      role="list"
      cellComponent={({ value, x, y, size, color }) => (
        <rect
          x={x}
          y={y}
          width={size}
          height={size}
          fill={color}
          aria-label={`${value?.count ?? 0} repasos el ${new Date(value?.date ?? '').toLocaleDateString()}`}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onCellClick?.({ date: new Date(value!.date), reviews: value!.count });
          }}
          className="focus:outline-none focus-visible:ring-2"
        />
      )}
    />
  );
};
export default StudyHeatmap;
