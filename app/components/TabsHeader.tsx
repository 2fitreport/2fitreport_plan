'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { Suspense } from 'react';
import styles from './TabsHeader.module.css';

function TabsHeaderContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const getActiveTab = () => {
    if (pathname.startsWith('/memos')) return '진행기업';
    if (pathname === '/' && searchParams.get('tab') === '회의') return '회의';
    if (pathname === '/' && searchParams.get('tab') === '일정') return '일정';
    if (pathname === '/' && (!searchParams.get('tab') || searchParams.get('tab') === '진행기업')) return '진행기업';
    if (pathname.startsWith('/meetings')) return '회의';
    if (searchParams.get('type') === 'meeting') return '회의';
    return '일정';
  };

  const activeTab = getActiveTab();

  return (
    <nav className={styles.tabs}>
      <button
        type="button"
        className={`${styles.tab} ${activeTab === '진행기업' ? styles.active : ''}`}
        onClick={() => router.push('/?tab=진행기업')}
      >
        진행기업
      </button>
      <button
        type="button"
        className={`${styles.tab} ${activeTab === '일정' ? styles.active : ''}`}
        onClick={() => router.push('/?tab=일정')}
      >
        일정
      </button>
      <button
        type="button"
        className={`${styles.tab} ${activeTab === '회의' ? styles.active : ''}`}
        onClick={() => router.push('/?tab=회의')}
      >
        회의
      </button>
    </nav>
  );
}

export default function TabsHeader() {
  return (
    <Suspense fallback={<div className={styles.tabs} />}>
      <TabsHeaderContent />
    </Suspense>
  );
}
