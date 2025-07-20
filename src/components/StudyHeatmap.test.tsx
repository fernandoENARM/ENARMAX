import React from 'react';
import { render } from '@testing-library/react';
import StudyHeatmap, { ReviewDay } from './StudyHeatmap';

describe('StudyHeatmap', () => {
  test('renderiza 365 celdas', () => {
    const today = new Date();
    const data: ReviewDay[] = [];
    for (let i = 0; i < 365; i++) {
      data.push({ date: new Date(today.getTime() - i * 86400000), reviews: 0 });
    }
    const { container } = render(<StudyHeatmap data={data} />);
    expect(container.querySelectorAll('[data-testid="heatmap-cell"]').length).toBe(365);
  });

  test('celdas con >10 repasos usan color oscuro', () => {
    const data: ReviewDay[] = [
      { date: new Date(), reviews: 11 },
    ];
    const { container } = render(<StudyHeatmap data={data} />);
    const cell = container.querySelector('[data-testid="heatmap-cell"]');
    expect(cell?.className).toContain('bg-emerald-700');
  });
});
