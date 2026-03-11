'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './page.module.css';
import { supabase } from '@/lib/supabase';

interface Post {
  id: string;
  title: string;
  content: string;
  date: string;
  created_at: string;
  updated_at: string;
  status: string;
  comment_count?: number;
}

export default function DatePostsPage() {
  const params = useParams();
  const router = useRouter();
  const year = params?.year as string;
  const month = params?.month as string;
  const day = params?.day as string;

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const dateString = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  const formatDateDisplay = (y: string, m: string, d: string) => {
    return `${y}년 ${m}월 ${d}일`;
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

  // 해당 날짜의 게시물 가져오기
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const { data, error } = await supabase
          .from('posts')
          .select('*')
          .eq('date', dateString)
          .order('created_at', { ascending: false });

        if (error) throw error;

        // 각 게시물의 댓글 개수 가져오기
        const postsWithCommentCount = await Promise.all(
          (data || []).map(async (post) => {
            const { count, error: countError } = await supabase
              .from('comments')
              .select('*', { count: 'exact', head: true })
              .eq('post_id', post.id);

            return {
              ...post,
              comment_count: countError ? 0 : count || 0,
            };
          })
        );

        setPosts(postsWithCommentCount);
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [dateString]);

  return (
    <div className={styles.container}>
      <button
        type="button"
        onClick={() => router.back()}
        className={styles.backButton}
      >
        ← 달력으로 돌아가기
      </button>

      <div className={styles.content}>
        <div className={styles.header}>
          <h1 className={styles.title}>
            {formatDateDisplay(year, month, day)}
          </h1>
          <Link href="/posts/new" className={styles.createButton}>
            + 새 일정
          </Link>
        </div>

        {loading ? (
          <div className={styles.loadingState}>
            <p>로딩 중...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className={styles.emptyState}>
            <p className={styles.emptyText}>이 날짜에 등록된 일정이 없습니다</p>
          </div>
        ) : (
          <table className={styles.postsTable}>
            <thead>
              <tr>
                <th className={styles.titleCol}>제목</th>
                <th className={styles.statusCol}>상태</th>
                <th className={styles.commentCol}>댓글</th>
                <th className={styles.dateCol}>작성일시</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr
                  key={post.id}
                  className={styles.tableRow}
                  onClick={() => router.push(`/posts/${post.id}`)}
                >
                  <td className={styles.titleCol}>
                    <div className={styles.titleCell}>{post.title}</div>
                  </td>
                  <td className={styles.statusCol}>
                    <div
                      className={`${styles.statusCell} ${
                        post.status === '진행중'
                          ? styles.statusPending
                          : post.status === '검수'
                          ? styles.statusReview
                          : post.status === '완료'
                          ? styles.statusDone
                          : styles.statusHold
                      }`}
                    >
                      {post.status === '완료' ? '완료' : post.status}
                    </div>
                  </td>
                  <td className={styles.commentCol}>
                    <div className={styles.commentCountCell}>
                      {post.comment_count || 0}
                    </div>
                  </td>
                  <td className={styles.dateCol}>
                    <div className={styles.dateCell}>
                      {formatDateTime(post.created_at)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
