'use client';

import { useEffect, useState, Suspense } from 'react';
import Calendar from '@/app/components/Calendar';
import styles from './page.module.css';
import { SelectedDate } from '@/app/types';
import { supabase } from '@/lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';
import PasswordModal, { checkAuth } from '@/app/components/PasswordModal';

type TabType = '진행기업' | '일정' | '회의';

interface Memo {
  id: string;
  company_name: string;
  representative_name: string;
  title: string;
  author: string;
  content: string;
  created_at: string;
  updated_at: string;
  memo_comments: { content: string }[];
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

  const [activeTab, setActiveTab] = useState<TabType>('진행기업');
  const [searchQuery, setSearchQuery] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [pendingTab, setPendingTab] = useState<'일정' | '회의' | null>(null);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === '일정' || tab === '회의') {
      if (checkAuth()) {
        setActiveTab(tab);
      } else {
        setPendingTab(tab);
        setShowPasswordModal(true);
      }
    } else {
      setActiveTab('진행기업');
    }
  }, [searchParams]);
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
          supabase.from('memos').select('*, memo_comments(content)').order('updated_at', { ascending: false }),
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

  const handleAuthSuccess = () => {
    setShowPasswordModal(false);
    if (pendingTab) {
      setActiveTab(pendingTab);
      setPendingTab(null);
    }
  };

  const handleAuthCancel = () => {
    setShowPasswordModal(false);
    setPendingTab(null);
    router.push('/?tab=진행기업');
  };

  return (
    <div className={styles.container}>
      {showPasswordModal && (
        <PasswordModal onSuccess={handleAuthSuccess} onCancel={handleAuthCancel} />
      )}
      {activeTab === '진행기업' ? (
        <div className={styles.memoContent}>
          <div className={styles.memoHeader}>
            <h1 className={styles.memoTitle}>진행기업</h1>
            <button
              type="button"
              className={styles.createButton}
              onClick={() => router.push('/memos/new')}
            >
              + 새 기업
            </button>
          </div>

          <div className={styles.searchBar}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="기업명, 대표자명, 내용, 메모, 작성자 검색..."
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
                  (m.title || '').toLowerCase().includes(q) ||
                  (m.author || '').toLowerCase().includes(q) ||
                  (m.content || '').toLowerCase().includes(q) ||
                  (m.memo_comments || []).some((c) => (c.content || '').toLowerCase().includes(q))
                )
              : memos;

            if (filtered.length === 0) {
              return (
                <div className={styles.emptyState}>
                  <p className={styles.emptyText}>
                    {q ? '검색 결과가 없습니다' : '등록된 기업이 없습니다'}
                  </p>
                </div>
              );
            }

            return (
              <div className={styles.memoList}>
                {filtered.map((memo) => (
                  <div
                    key={memo.id}
                    className={styles.memoItem}
                    onClick={() => router.push(`/memos/${memo.id}`)}
                  >
                    {memo.company_name || '-'}
                    <span className={styles.memoItemTime}>
                      {new Date(memo.updated_at || memo.created_at).toLocaleString('ko-KR', {
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                ))}
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
