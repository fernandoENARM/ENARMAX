import { calculateStreaks, SimpleDay } from './stats';

describe('calculateStreaks', () => {
  test('sin actividad devuelve 0', () => {
    expect(calculateStreaks([]).current).toBe(0);
  });
});
