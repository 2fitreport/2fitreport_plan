'use client';

import { useState } from 'react';
import styles from './EditModal.module.css';

interface MemoEditModalProps {
  isOpen: boolean;
  companyName: string;
  representativeName: string;
  title: string;
  author: string;
  content: string;
  onSave: (companyName: string, representativeName: string, title: string, author: string, content: string) => void;
  onCancel: () => void;
}

export default function MemoEditModal({
  isOpen,
  companyName: initialCompanyName,
  representativeName: initialRepresentativeName,
  title: initialTitle,
  author: initialAuthor,
  content: initialContent,
  onSave,
  onCancel,
}: MemoEditModalProps) {
  const [companyName, setCompanyName] = useState(initialCompanyName);
  const [representativeName, setRepresentativeName] = useState(initialRepresentativeName);
  const [title, setTitle] = useState(initialTitle);
  const [author, setAuthor] = useState(initialAuthor);
  const [content, setContent] = useState(initialContent);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>메모 수정</h2>
          <button type="button" onClick={onCancel} className={styles.closeButton}>✕</button>
        </div>

        <div className={styles.content}>
          <div className={styles.formRow} style={{ marginBottom: 20 }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <label className={styles.label}>기업명</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className={styles.input}
                placeholder="기업명을 입력하세요"
              />
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <label className={styles.label}>대표자명</label>
              <input
                type="text"
                value={representativeName}
                onChange={(e) => setRepresentativeName(e.target.value)}
                className={styles.input}
                placeholder="대표자명을 입력하세요"
              />
            </div>
          </div>

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
            <label className={styles.label}>작성자</label>
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className={styles.input}
              placeholder="작성자 이름"
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
          <button type="button" onClick={onCancel} className={styles.cancelButton}>취소</button>
          <button
            type="button"
            onClick={() => onSave(companyName, representativeName, title, author, content)}
            className={styles.saveButton}
          >
            저장
          </button>
        </div>
      </div>
    </div>
  );
}
