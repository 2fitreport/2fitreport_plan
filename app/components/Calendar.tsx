'use client';

import { useState } from 'react';
import styles from './Calendar.module.css';
import { SelectedDate } from '@/app/types';
import MonthYearPicker from './MonthYearPicker';

interface CalendarProps {
  selectedDate: SelectedDate;
  onDateSelect: (date: SelectedDate) => void;
  postsOnDate: Record<string, Array<{ title: string; status: string }>>; // 날짜별 게시물 제목과 상태
  statusCounts: {
    진행중: number;
    검수: number;
    완료: number;
    보류: number;
  };
}

export default function Calendar({ selectedDate, onDateSelect, postsOnDate, statusCounts }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth(),
  });
  const [showPicker, setShowPicker] = useState(false);

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const daysInMonth = getDaysInMonth(currentMonth.year, currentMonth.month);
  const firstDay = getFirstDayOfMonth(currentMonth.year, currentMonth.month);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDay }, (_, i) => i);

  const handlePrevMonth = () => {
    setCurrentMonth((prev) => {
      if (prev.month === 0) {
        return { year: prev.year - 1, month: 11 };
      }
      return { ...prev, month: prev.month - 1 };
    });
  };

  const handleNextMonth = () => {
    setCurrentMonth((prev) => {
      if (prev.month === 11) {
        return { year: prev.year + 1, month: 0 };
      }
      return { ...prev, month: prev.month + 1 };
    });
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentMonth({
      year: today.getFullYear(),
      month: today.getMonth(),
    });
  };

  const formatDate = (year: number, month: number, date: number) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
  };

  const isSelected = (date: number) => {
    return (
      selectedDate.year === currentMonth.year &&
      selectedDate.month === currentMonth.month &&
      selectedDate.date === date
    );
  };

  const monthNames = [
    '1월', '2월', '3월', '4월', '5월', '6월',
    '7월', '8월', '9월', '10월', '11월', '12월'
  ];

  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];

  return (
    <div className={styles.calendar}>
      <div className={styles.header}>
        <button type="button" onClick={handlePrevMonth} className={styles.navButton}>←</button>
        <div className={styles.headerCenter}>
          <button
            type="button"
            onClick={() => setShowPicker(!showPicker)}
            className={styles.titleButton}
          >
            {monthNames[currentMonth.month]} {currentMonth.year}
          </button>
          <button type="button" onClick={handleToday} className={styles.todayButton}>
            이번달
          </button>
        </div>
        <button type="button" onClick={handleNextMonth} className={styles.navButton}>→</button>
      </div>

      <div className={styles.legend}>
        <div className={styles.legendItem}>
          <div className={`${styles.legendColor} ${styles.statusPending}`}></div>
          <span>진행중</span>
        </div>
        <div className={styles.legendItem}>
          <div className={`${styles.legendColor} ${styles.statusReview}`}></div>
          <span>검수</span>
        </div>
        <div className={styles.legendItem}>
          <div className={`${styles.legendColor} ${styles.statusDone}`}></div>
          <span>완료</span>
        </div>
        <div className={styles.legendItem}>
          <div className={`${styles.legendColor} ${styles.statusHold}`}></div>
          <span>보류</span>
        </div>
      </div>

      <div className={styles.statusSummary}>
        <div className={styles.summaryItem}>
          <div className={`${styles.summaryDot} ${styles.statusPending}`}></div>
          <span className={styles.summaryLabel}>진행중</span>
          <span className={styles.summaryCount}>{statusCounts.진행중}</span>
        </div>
        <div className={styles.summaryItem}>
          <div className={`${styles.summaryDot} ${styles.statusReview}`}></div>
          <span className={styles.summaryLabel}>검수</span>
          <span className={styles.summaryCount}>{statusCounts.검수}</span>
        </div>
        <div className={styles.summaryItem}>
          <div className={`${styles.summaryDot} ${styles.statusDone}`}></div>
          <span className={styles.summaryLabel}>완료</span>
          <span className={styles.summaryCount}>{statusCounts.완료}</span>
        </div>
        <div className={styles.summaryItem}>
          <div className={`${styles.summaryDot} ${styles.statusHold}`}></div>
          <span className={styles.summaryLabel}>보류</span>
          <span className={styles.summaryCount}>{statusCounts.보류}</span>
        </div>
      </div>

      {showPicker && (
        <MonthYearPicker
          year={currentMonth.year}
          month={currentMonth.month}
          onSelect={(year, month) => {
            setCurrentMonth({ year, month });
            setShowPicker(false);
          }}
          onClose={() => setShowPicker(false)}
        />
      )}

      <div className={styles.weekDays}>
        {dayNames.map((day) => (
          <div key={day} className={styles.weekDay}>
            {day}
          </div>
        ))}
      </div>

      <div className={styles.daysGrid}>
        {emptyDays.map((_, i) => (
          <div key={`empty-${i}`} className={styles.emptyDay} />
        ))}

        {days.map((day) => {
          const dateStr = formatDate(currentMonth.year, currentMonth.month, day);
          const posts = postsOnDate[dateStr] || [];
          const selected = isSelected(day);

          return (
            <button
              key={day}
              type="button"
              onClick={() =>
                onDateSelect({
                  year: currentMonth.year,
                  month: currentMonth.month,
                  date: day,
                })
              }
              className={`${styles.day} ${selected ? styles.selected : ''} ${
                posts.length > 0 ? styles.hasPost : ''
              }`}
            >
              <span className={styles.dayNumber}>{day}</span>
              {posts.length > 0 && (
                <div className={styles.postsList}>
                  {posts.map((post, idx) => (
                    <div
                      key={idx}
                      className={`${styles.postItem} ${
                        post.status === '진행중'
                          ? styles.statusPending
                          : post.status === '검수'
                          ? styles.statusReview
                          : post.status === '완료'
                          ? styles.statusDone
                          : styles.statusHold
                      }`}
                      title={`${post.title} [${post.status === '완료' ? '완료' : post.status}]`}
                    >
                      {post.title}
                    </div>
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
