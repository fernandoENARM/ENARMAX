import React from 'react';
import { render, screen } from '@testing-library/react';
import StudyHeatmap from '../src/components/StudyHeatmap';
import { getStreak } from '../src/components/StatsSidebar';

describe('StudyHeatmap', () => {
  test('renderiza 365 celdas', () => {
    const start = new Date('2023-01-01');
    const data = Array.from({ length: 365 }, (_, i) => ({ date: new Date(start.getTime() + i * 86400000), reviews: 0 }));
    render(<StudyHeatmap data={data} startDate={start} endDate={new Date(start.getTime() + 364 * 86400000)} />);
    const cells = screen.getAllByRole('list')[0].querySelectorAll('rect');
    expect(cells.length).toBe(365);
  });

  test('celdas con reviews>10 tienen clase bg-emerald-700', () => {
    const data = [{ date: new Date(), reviews: 11 }];
    render(<StudyHeatmap data={data} />);
    const cell = screen.getByLabelText(/repasos el/);
    expect(cell).toHaveAttribute('fill', '#059669');
  });
});

describe('getStreak', () => {
  test('sin actividad devuelve 0', () => {
    expect(getStreak([]).current).toBe(0);
  });
});
