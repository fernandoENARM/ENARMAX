export interface ScheduleInput {
  easeFactor: number;
  interval: number;
  repetitions: number;
  quality: 0 | 1 | 2 | 3 | 4 | 5;
  now?: Date;
}

export interface ScheduleOutput {
  nextReview: Date;
  newInterval: number;
  newRepetitions: number;
  newEaseFactor: number;
}

export default function scheduleCard({
  easeFactor,
  interval,
  repetitions,
  quality,
  now = new Date(),
}: ScheduleInput): ScheduleOutput {
  let newRepetitions: number;
  let newInterval: number;

  if (quality >= 3) {
    newRepetitions = repetitions + 1;
    if (newRepetitions === 1) {
      newInterval = 1;
    } else if (newRepetitions === 2) {
      newInterval = 6;
    } else {
      newInterval = Math.round(interval * easeFactor);
    }
  } else {
    newRepetitions = 0;
    newInterval = 1;
  }

  const newEaseFactor = Math.max(
    1.3,
    easeFactor + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)
  );

  const nextReview = new Date(now.getTime() + newInterval * 86400000);

  return {
    nextReview,
    newInterval,
    newRepetitions,
    newEaseFactor,
  };
}
