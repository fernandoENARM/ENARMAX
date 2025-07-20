import React from 'react';
import CalendarHeatmap from 'react-calendar-heatmap';
import { format } from 'date-fns';

export interface ReviewDay {
  date: string | Date;
  reviews: number;
  accuracy?: number;
}

export interface StudyHeatmapProps {
  data: ReviewDay[];
  onCellClick?: (day: ReviewDay) => void;
}

function classForValue(value?: { count: number }): string {
  if (!value || value.count === 0) return 'bg-emerald-50 dark:bg-indigo-50';
  if (value.count <= 5) return 'bg-emerald-300 dark:bg-indigo-300';
  if (value.count <= 10) return 'bg-emerald-500 dark:bg-indigo-500';
  return 'bg-emerald-700 dark:bg-indigo-700';
}

const StudyHeatmap: React.FC<StudyHeatmapProps> = ({ data, onCellClick }) => {
  const today = new Date();
  const startDate = new Date(today.getTime() - 364 * 86400000);

  const values = data.map((d) => ({
    date: typeof d.date === 'string' ? d.date : d.date.toISOString().slice(0, 10),
    count: d.reviews,
    accuracy: d.accuracy,
  }));

  return (
    <div className="w-full" style={{ height: '140px' }}>
      <CalendarHeatmap
        startDate={startDate}
        endDate={today}
        values={values}
        gutterSize={4}
        classForValue={classForValue}
        titleForValue={(value) => {
          if (!value || !value.date) return '0 repasos';
          const accuracy = value.accuracy !== undefined ? `, ${value.accuracy}%` : '';
          return `${value.count} repasos${accuracy}`;
        }}
        ariaLabelForValue={(value) => {
          if (!value || !value.date) return '0 repasos';
          const date = format(new Date(value.date), 'dd/MM/yyyy');
          return `${value.count} repasos el ${date}`;
        }}
        onClick={(value) => {
          if (onCellClick && value && value.date) {
            const original = data.find(
              (d) => (typeof d.date === 'string' ? d.date : d.date.toISOString().slice(0, 10)) === value.date,
            );
            if (original) onCellClick(original);
          }
        }}
        // data-testid is added through transformDayElement
        transformDayElement={(el, value) => {
          return React.cloneElement(el, { 'data-testid': 'heatmap-cell', tabIndex: 0 });
        }}
      />
    </div>
  );
};

export default StudyHeatmap;
