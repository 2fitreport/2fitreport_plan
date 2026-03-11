'use client';

import styles from './MonthYearPicker.module.css';

interface MonthYearPickerProps {
  year: number;
  month: number;
  onSelect: (year: number, month: number) => void;
  onClose: () => void;
}

export default function MonthYearPicker({
  year,
  month,
  onSelect,
  onClose,
}: MonthYearPickerProps) {
  const monthNames = [
    '1월', '2월', '3월', '4월', '5월', '6월',
    '7월', '8월', '9월', '10월', '11월', '12월'
  ];

  const currentYear = new Date().getFullYear();
  const yearRange = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);

  return (
    <>
      <div className={styles.overlay} onClick={onClose} />
      <div className={styles.picker}>
        <div className={styles.section}>
          <h3 className={styles.label}>연도</h3>
          <div className={styles.grid}>
            {yearRange.map((y) => (
              <button
                key={y}
                type="button"
                onClick={() => onSelect(y, month)}
                className={`${styles.item} ${y === year ? styles.selected : ''}`}
              >
                {y}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.section}>
          <h3 className={styles.label}>월</h3>
          <div className={styles.monthGrid}>
            {monthNames.map((m, idx) => (
              <button
                key={m}
                type="button"
                onClick={() => onSelect(year, idx)}
                className={`${styles.item} ${idx === month ? styles.selected : ''}`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
