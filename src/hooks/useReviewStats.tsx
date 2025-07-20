import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import StudyHeatmap from '../components/StudyHeatmap';
import StatsSidebar from '../components/StatsSidebar';

export interface ReviewStat {
  date: Date;
  reviews: number;
  accuracy?: number;
}

/**
 * Obtiene estadísticas de revisión desde Firestore.
 */
export const useReviewStats = (userId: string, startDate: Date) => {
  const [data, setData] = useState<ReviewStat[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const q = query(collection(db, 'reviews'), where('userId', '==', userId), where('date', '>=', startDate));
      const snap = await getDocs(q);
      const byDate: Record<string, { correct: number; total: number }> = {};
      snap.forEach((doc) => {
        const { date, correct, total } = doc.data();
        const key = date.split('T')[0];
        if (!byDate[key]) byDate[key] = { correct: 0, total: 0 };
        byDate[key].correct += correct;
        byDate[key].total += total;
      });
      const result: ReviewStat[] = Object.entries(byDate).map(([d, v]) => ({
        date: new Date(d),
        reviews: v.total,
        accuracy: (v.correct / v.total) * 100,
      }));
      setData(result);
    };
    fetchData();
  }, [userId, startDate]);

  return data;
};

export const ReviewStats: React.FC<{ userId: string; startDate: Date }> = ({ userId, startDate }) => {
  const data = useReviewStats(userId, startDate);

  return (
    <div className="flex">
      <StudyHeatmap data={data} />
      <StatsSidebar data={data} />
    </div>
  );
};
