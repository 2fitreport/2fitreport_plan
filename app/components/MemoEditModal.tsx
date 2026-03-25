'use client';

import { useState } from 'react';
import styles from './EditModal.module.css';

interface MemoEditModalProps {
  isOpen: boolean;
  companyName: string;
  representativeName: string;
  phone: string;
  author: string;
  content: string;
  onSave: (companyName: string, representativeName: string, phone: string, author: string, content: string) => void;
  onCancel: () => void;
}

export default function MemoEditModal({
  isOpen,
  companyName: initialCompanyName,
  representativeName: initialRepresentativeName,
  phone: initialPhone,
  author: initialAuthor,
  content: initialContent,
  onSave,
  onCancel,
}: MemoEditModalProps) {
  const [companyName, setCompanyName] = useState(initialCompanyName);
  const [representativeName, setRepresentativeName] = useState(initialRepresentativeName);
  const formatPhone = (value: string) => {
    const nums = value.replace(/[^0-9]/g, '');
    if (nums.length <= 3) return nums;
    if (nums.length <= 7) return `${nums.slice(0, 3)}-${nums.slice(3)}`;
    return `${nums.slice(0, 3)}-${nums.slice(3, 7)}-${nums.slice(7, 11)}`;
  };
  const [phone, setPhone] = useState(initialPhone);
  const [author, setAuthor] = useState(initialAuthor);
  const [content, setContent] = useState(initialContent);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>기업 수정</h2>
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
            <label className={styles.label}>전화번호</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(formatPhone(e.target.value))}
              className={styles.input}
              placeholder="전화번호를 입력하세요"
              maxLength={13}
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
            <label className={styles.label}>상담내용 및 자금계획</label>
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
            onClick={() => onSave(companyName, representativeName, phone, author, content)}
            className={styles.saveButton}
          >
            저장
          </button>
        </div>
      </div>
    </div>
  );
}
