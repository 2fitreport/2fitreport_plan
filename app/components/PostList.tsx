'use client';

import Link from 'next/link';
import styles from './PostList.module.css';
import { Post, SelectedDate } from '@/app/types';

interface PostListProps {
  selectedDate: SelectedDate;
  posts: Post[];
  onPostSelect: (post: Post) => void;
}

export default function PostList({ selectedDate, posts, onPostSelect }: PostListProps) {
  const formatDateDisplay = (year: number, month: number, date: number) => {
    return `${year}년 ${month + 1}월 ${date}일`;
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className={styles.postList}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          {formatDateDisplay(selectedDate.year, selectedDate.month, selectedDate.date)}
        </h2>
        <Link href="/posts/new" className={styles.createButton}>
          + 새 글
        </Link>
      </div>

      {posts.length === 0 ? (
        <div className={styles.emptyState}>
          <p className={styles.emptyText}>이 날짜에 등록된 일정이 없습니다</p>
          <p className={styles.emptySubtext}>새로운 일정을 등록해보세요</p>
        </div>
      ) : (
        <div className={styles.items}>
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/posts/${post.id}`}
              className={styles.item}
              onClick={() => onPostSelect(post)}
            >
              <div className={styles.itemContent}>
                <h3 className={styles.itemTitle}>{post.title}</h3>
                <p className={styles.itemPreview}>{post.content.substring(0, 80)}...</p>
              </div>
              <div className={styles.itemMeta}>
                <span className={styles.itemTime}>
                  {formatTime(post.createdAt)}
                </span>
                <span className={styles.arrow}>→</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
