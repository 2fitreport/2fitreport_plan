'use client';

import { useEffect, useState, Suspense } from 'react';
import Calendar from '@/app/components/Calendar';
import styles from './page.module.css';
import { SelectedDate } from '@/app/types';
import { supabase } from '@/lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';

type TabType = '메모' | '일정' | '회의';

interface Memo {
  id: string;
  company_name: string;
  representative_name: string;
  title: string;
  author: string;
  created_at: string;
}

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState<SelectedDate>({
    year: today.getFullYear(),
    month: today.getMonth(),
    date: today.getDate(),
  });

  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState<TabType>(
    tabParam === '일정' || tabParam === '회의' ? tabParam : '메모'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [posts, setPosts] = useState<any[]>([]);
  const [meetings, setMeetings] = useState<any[]>([]);
  const [memos, setMemos] = useState<Memo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          { data: postsData, error: postsError },
          { data: meetingsData, error: meetingsError },
          { data: memosData, error: memosError },
        ] = await Promise.all([
          supabase.from('posts').select('*').order('created_at', { ascending: false }),
          supabase.from('meetings').select('*').order('created_at', { ascending: false }),
          supabase.from('memos').select('*').order('created_at', { ascending: false }),
        ]);

        if (postsError) throw postsError;
        if (meetingsError) throw meetingsError;
        if (memosError) throw memosError;

        setPosts(postsData || []);
        setMeetings(meetingsData || []);

        setMemos(memosData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const transformData = (data: any[], includeStatus: boolean) => {
    return data.reduce(
      (acc, item) => {
        const start = new Date(item.start_date || item.date);
        const end = new Date(item.end_date || item.start_date || item.date);

        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
          if (!acc[key]) acc[key] = [];
          const entry: any = { title: item.title };
          if (includeStatus) entry.status = item.status;
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

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.tabs}>
        <button
          type="button"
          className={`${styles.tab} ${activeTab === '메모' ? styles.active : ''}`}
          onClick={() => setActiveTab('메모')}
        >
          메모
        </button>
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

      {activeTab === '메모' ? (
        <div className={styles.memoContent}>
          <div className={styles.memoHeader}>
            <h1 className={styles.memoTitle}>메모</h1>
            <button
              type="button"
              className={styles.createButton}
              onClick={() => router.push('/memos/new')}
            >
              + 새 메모
            </button>
          </div>

          <div className={styles.searchBar}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="기업명, 대표자명, 제목, 작성자 검색..."
              className={styles.searchInput}
            />
            {searchQuery && (
              <button
                type="button"
                className={styles.searchClear}
                onClick={() => setSearchQuery('')}
              >
                ✕
              </button>
            )}
          </div>

          {loading ? (
            <div className={styles.loadingState}><p>로딩 중...</p></div>
          ) : (() => {
            const q = searchQuery.toLowerCase();
            const filtered = q
              ? memos.filter((m) =>
                  (m.company_name || '').toLowerCase().includes(q) ||
                  (m.representative_name || '').toLowerCase().includes(q) ||
                  m.title.toLowerCase().includes(q) ||
                  (m.author || '').toLowerCase().includes(q)
                )
              : memos;

            if (filtered.length === 0) {
              return (
                <div className={styles.emptyState}>
                  <p className={styles.emptyText}>
                    {q ? '검색 결과가 없습니다' : '등록된 메모가 없습니다'}
                  </p>
                </div>
              );
            }

            return (
              <div className={styles.memoTableWrapper}>
              <table className={styles.memoTable}>
                <thead>
                  <tr>
                    <th className={styles.companyCol}>기업명</th>
                    <th className={styles.repCol}>대표자명</th>
                    <th className={styles.memoTitleCol}>제목</th>
                    <th className={styles.authorCol}>작성자</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((memo) => (
                    <tr
                      key={memo.id}
                      className={styles.tableRow}
                      onClick={() => router.push(`/memos/${memo.id}`)}
                    >
                      <td className={styles.companyCol}>
                        <div className={styles.cellText}>{memo.company_name || '-'}</div>
                      </td>
                      <td className={styles.repCol}>
                        <div className={styles.cellText}>{memo.representative_name || '-'}</div>
                      </td>
                      <td className={styles.memoTitleCol}>
                        <div className={styles.titleCell}>{memo.title}</div>
                      </td>
                      <td className={styles.authorCol}>
                        <div className={styles.cellText}>{memo.author || '미지정'}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            );
          })()}
        </div>
      ) : (
        <div className={styles.calendarWrapper}>
          <Calendar
            selectedDate={selectedDate}
            onDateSelect={handleDateSelect}
            postsOnDate={postsOnDate}
            statusCounts={statusCounts}
            mode={activeTab}
          />
        </div>
      )}
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div />}>
      <HomeContent />
    </Suspense>
  );
}
