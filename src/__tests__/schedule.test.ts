declare const window: any;

interface Card {
  efactor?: number;
  repetitions?: number;
  interval?: number;
  nextReview?: string;
  lastReviewed?: string;
  quality?: number;
}

describe('scheduleCard', () => {
  beforeEach(() => {
    (global as any).window = {};
    delete require.cache[require.resolve('../../schedule')];
    require('../../schedule');
  });

  test('schedules new card correctly with quality 5', () => {
    const card: Card = {};
    (window as any).scheduleCard(card, 5);
    expect(card.repetitions).toBe(1);
    expect(card.interval).toBe(1);
    expect(card.efactor).toBeCloseTo(2.6, 5);
  });

  test('resets repetitions and interval on low quality', () => {
    const card: Card = { efactor: 2.5, repetitions: 3, interval: 10 };
    (window as any).scheduleCard(card, 2);
    expect(card.repetitions).toBe(0);
    expect(card.interval).toBe(1);
    expect(card.efactor).toBe(2.5);
  });

  test('computes next interval and efactor for subsequent reviews', () => {
    const card: Card = { efactor: 2.6, repetitions: 1, interval: 1 };
    (window as any).scheduleCard(card, 5);
    expect(card.repetitions).toBe(2);
    expect(card.interval).toBe(6);
    expect(card.efactor).toBeCloseTo(2.7, 5);

    (window as any).scheduleCard(card, 5);
    expect(card.repetitions).toBe(3);
    expect(card.interval).toBe(16);
    expect(card.efactor).toBeCloseTo(2.8, 5);
  });

  test('efactor does not drop below 1.3', () => {
    const card: Card = { efactor: 1.4, repetitions: 3, interval: 10 };
    (window as any).scheduleCard(card, 3);
    expect(card.efactor).toBeGreaterThanOrEqual(1.3);
  });
});
