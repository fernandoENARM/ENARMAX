import { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { calculateStreaks } from '../utils/stats';
import { ReviewDay } from '../components/StudyHeatmap';

export interface ReviewStats {
  data: ReviewDay[];
  totalReviews: number;
  averageAccuracy: number;
  streak: number;
  maxStreak: number;
}

export function useReviewStats(userId: string): ReviewStats {
  const [stats, setStats] = useState<ReviewStats>({
    data: [],
    totalReviews: 0,
    averageAccuracy: 0,
    streak: 0,
    maxStreak: 0,
  });

  useEffect(() => {
    async function fetchData() {
      const end = new Date();
      const start = new Date(end.getTime() - 364 * 86400000);
      const q = query(
        collection(db, 'reviews'),
        where('userId', '==', userId),
        where('date', '>=', start),
        where('date', '<=', end),
      );
      const snap = await getDocs(q);
      const map: Record<string, ReviewDay> = {};
      snap.forEach((doc) => {
        const d = doc.data();
        const day = new Date(d.date.seconds ? d.date.seconds * 1000 : d.date);
        const key = day.toISOString().slice(0, 10);
        if (!map[key]) {
          map[key] = { date: key, reviews: 0, accuracy: 0 };
        }
        map[key].reviews += d.reviews;
        if (d.accuracy !== undefined) {
          map[key].accuracy = ((map[key].accuracy || 0) + d.accuracy) / 2;
        }
      });
      const data = Object.values(map).sort((a, b) => (a.date > b.date ? 1 : -1));
      const totalReviews = data.reduce((sum, d) => sum + d.reviews, 0);
      const allAccuracy = data.filter((d) => d.accuracy !== undefined);
      const averageAccuracy = allAccuracy.length
        ? allAccuracy.reduce((sum, d) => sum + (d.accuracy || 0), 0) / allAccuracy.length
        : 0;
      const { current, max } = calculateStreaks(data.map((d) => ({ date: new Date(d.date), reviews: d.reviews })));
      setStats({ data, totalReviews, averageAccuracy, streak: current, maxStreak: max });
    }
    fetchData();
  }, [userId]);

  return stats;
}
