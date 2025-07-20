import scheduleCard from './scheduleCard';

describe('scheduleCard', () => {
  test('Nueva tarjeta calidad 5 -> nextReview = mañana', () => {
    const now = new Date('2020-01-01T00:00:00Z');
    const result = scheduleCard({
      easeFactor: 2.5,
      interval: 0,
      repetitions: 0,
      quality: 5,
      now,
    });
    expect(result.newInterval).toBe(1);
    expect(result.nextReview.getTime()).toBe(new Date('2020-01-02T00:00:00Z').getTime());
  });

  test('Tres aciertos consecutivos generan intervalos 1, 6, 15', () => {
    const now = new Date('2020-01-01T00:00:00Z');
    let res = scheduleCard({ easeFactor: 2.5, interval: 0, repetitions: 0, quality: 5, now });
    expect(res.newInterval).toBe(1);
    res = scheduleCard({ easeFactor: res.newEaseFactor, interval: res.newInterval, repetitions: res.newRepetitions, quality: 4, now });
    expect(res.newInterval).toBe(6);
    const int2 = res.newInterval;
    const ef2 = res.newEaseFactor;
    res = scheduleCard({ easeFactor: ef2, interval: int2, repetitions: res.newRepetitions, quality: 4, now });
    expect(res.newInterval).toBeGreaterThanOrEqual(14); // around 15
    expect(res.newInterval).toBeLessThanOrEqual(16);
  });

  test('Tarjeta difícil calidad 2 -> repetitions = 0, interval = 1', () => {
    const now = new Date('2020-01-01T00:00:00Z');
    const res = scheduleCard({ easeFactor: 2.5, interval: 5, repetitions: 3, quality: 2, now });
    expect(res.newRepetitions).toBe(0);
    expect(res.newInterval).toBe(1);
  });

  test('EF nunca baja de 1.3', () => {
    const now = new Date('2020-01-01T00:00:00Z');
    let ef = 1.3;
    for (let i = 0; i < 5; i++) {
      const res = scheduleCard({ easeFactor: ef, interval: 1, repetitions: 0, quality: 0, now });
      expect(res.newEaseFactor).toBeGreaterThanOrEqual(1.3);
      ef = res.newEaseFactor;
    }
  });
});
