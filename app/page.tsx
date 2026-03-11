'use client';

import { useEffect, useState } from 'react';
import Calendar from '@/app/components/Calendar';
import styles from './page.module.css';
import { SelectedDate } from '@/app/types';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

type TabType = '일정' | '회의';

export default function Home() {
  const router = useRouter();
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState<SelectedDate>({
    year: today.getFullYear(),
    month: today.getMonth(),
    date: today.getDate(),
  });

  const [activeTab, setActiveTab] = useState<TabType>('일정');
  const [posts, setPosts] = useState<any[]>([]);
  const [meetings, setMeetings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Supabase에서 모든 게시물과 회의 가져오기
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [{ data: postsData, error: postsError }, { data: meetingsData, error: meetingsError }] = await Promise.all([
          supabase.from('posts').select('*').order('created_at', { ascending: false }),
          supabase.from('meetings').select('*').order('created_at', { ascending: false }),
        ]);

        if (postsError) throw postsError;
        if (meetingsError) throw meetingsError;

        setPosts(postsData || []);
        setMeetings(meetingsData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 데이터 변환 함수
  const transformData = (data: any[], includeStatus: boolean) => {
    return data.reduce(
      (acc, item) => {
        const start = new Date(item.start_date || item.date);
        const end = new Date(item.end_date || item.start_date || item.date);

        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
          if (!acc[key]) {
            acc[key] = [];
          }
          const entry: any = {
            title: item.title,
          };
          if (includeStatus) {
            entry.status = item.status;
          }
          acc[key].push(entry);
        }
        return acc;
      },
      {} as Record<string, Array<any>>
    );
  };

  const currentData = activeTab === '일정' ? posts : meetings;
  const postsOnDate = transformData(currentData, activeTab === '일정');

  const statusCounts =
    activeTab === '일정'
      ? {
          진행중: posts.filter((p) => p.status === '진행중').length,
          검수: posts.filter((p) => p.status === '검수').length,
          완료: posts.filter((p) => p.status === '완료').length,
          보류: posts.filter((p) => p.status === '보류').length,
        }
      : { 진행중: 0, 검수: 0, 완료: 0, 보류: 0 };

  const handleDateSelect = (date: SelectedDate) => {
    setSelectedDate(date);
    const dateString = `${date.year}/${date.month + 1}/${date.date}`;
    const typeParam = activeTab === '회의' ? '?type=meeting' : '';
    router.push(`/date/${dateString}${typeParam}`);
  };

  return (
    <div className={styles.container}>
      <div className={styles.tabs}>
        <button
          type="button"
          className={`${styles.tab} ${activeTab === '일정' ? styles.active : ''}`}
          onClick={() => setActiveTab('일정')}
        >
          일정
        </button>
        <button
          type="button"
          className={`${styles.tab} ${activeTab === '회의' ? styles.active : ''}`}
          onClick={() => setActiveTab('회의')}
        >
          회의
        </button>
      </div>

      <div className={styles.calendarWrapper}>
        <Calendar
          selectedDate={selectedDate}
          onDateSelect={handleDateSelect}
          postsOnDate={postsOnDate}
          statusCounts={statusCounts}
          mode={activeTab}
        />
      </div>
    </div>
  );
}
