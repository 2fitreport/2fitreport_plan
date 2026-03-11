'use client';

import { useState } from 'react';
import styles from './EditModal.module.css';

interface EditModalProps {
  isOpen: boolean;
  title: string;
  date: string;
  content: string;
  onSave: (title: string, date: string, content: string) => void;
  onCancel: () => void;
}

export default function EditModal({
  isOpen,
  title: initialTitle,
  date: initialDate,
  content: initialContent,
  onSave,
  onCancel,
}: EditModalProps) {
  const [title, setTitle] = useState(initialTitle);
  const [date, setDate] = useState(initialDate);
  const [content, setContent] = useState(initialContent);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(title, date, content);
  };

  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>글 수정</h2>
          <button
            type="button"
            onClick={onCancel}
            className={styles.closeButton}
          >
            ✕
          </button>
        </div>

        <div className={styles.content}>
          <div className={styles.formGroup}>
            <label className={styles.label}>제목</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={styles.input}
              placeholder="제목을 입력하세요"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>날짜</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>내용</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className={styles.textarea}
              placeholder="내용을 입력하세요"
              rows={12}
            />
          </div>
        </div>

        <div className={styles.footer}>
          <button
            type="button"
            onClick={onCancel}
            className={styles.cancelButton}
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleSave}
            className={styles.saveButton}
          >
            저장
          </button>
        </div>
      </div>
    </div>
  );
}
