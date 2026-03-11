'use client';

import { useEffect, useState } from 'react';
import Calendar from '@/app/components/Calendar';
import styles from './page.module.css';
import { SelectedDate } from '@/app/types';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState<SelectedDate>({
    year: today.getFullYear(),
    month: today.getMonth(),
    date: today.getDate(),
  });

  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Supabase에서 모든 게시물 가져오기
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const { data, error } = await supabase
          .from('posts')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setPosts(data || []);
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  // 게시물 제목과 상태를 날짜별로 분류
  const postsOnDate = posts.reduce(
    (acc, post) => {
      if (!acc[post.date]) {
        acc[post.date] = [];
      }
      acc[post.date].push({
        title: post.title,
        status: post.status,
      });
      return acc;
    },
    {} as Record<string, Array<{ title: string; status: string }>>
  );

  // 상태별 개수 계산
  const statusCounts = {
    진행중: posts.filter((p) => p.status === '진행중').length,
    검수: posts.filter((p) => p.status === '검수').length,
    검수완료: posts.filter((p) => p.status === '검수완료').length,
    보류: posts.filter((p) => p.status === '보류').length,
  };

  const handleDateSelect = (date: SelectedDate) => {
    setSelectedDate(date);
    // 해당 날짜 페이지로 이동
    const dateString = `${date.year}/${date.month + 1}/${date.date}`;
    router.push(`/date/${dateString}`);
  };

  return (
    <div className={styles.container}>
      <div className={styles.calendarWrapper}>
        <Calendar
          selectedDate={selectedDate}
          onDateSelect={handleDateSelect}
          postsOnDate={postsOnDate}
          statusCounts={statusCounts}
        />
      </div>
    </div>
  );
}
