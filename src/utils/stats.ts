export interface SimpleDay {
  date: Date;
  reviews: number;
}

export function calculateStreaks(days: SimpleDay[]): { current: number; max: number } {
  if (days.length === 0) return { current: 0, max: 0 };
  const sorted = days
    .filter((d) => d.reviews > 0)
    .sort((a, b) => a.date.getTime() - b.date.getTime());
  if (sorted.length === 0) return { current: 0, max: 0 };
  let current = 1;
  let max = 1;
  for (let i = 1; i < sorted.length; i++) {
    const diff = (sorted[i].date.getTime() - sorted[i - 1].date.getTime()) / 86400000;
    if (diff === 1) {
      current += 1;
    } else if (diff > 1) {
      if (current > max) max = current;
      current = 1;
    }
  }
  if (current > max) max = current;

  const lastDiff = (new Date().setHours(0, 0, 0, 0) - sorted[sorted.length - 1].date.setHours(0, 0, 0, 0)) / 86400000;
  const activeStreak = lastDiff === 0 ? current : 0;
  return { current: activeStreak, max };
}
