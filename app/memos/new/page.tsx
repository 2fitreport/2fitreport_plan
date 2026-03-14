'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import { supabase } from '@/lib/supabase';
import ConfirmModal from '@/app/components/ConfirmModal';

export default function NewMemo() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    company_name: '',
    representative_name: '',
    title: '',
    author: '',
    content: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const savedAuthor = localStorage.getItem('author') || '';
    setFormData((prev) => ({ ...prev, author: savedAuthor }));
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setModalOpen(true);
  };

  const handleConfirmSubmit = async () => {
    setIsSubmitting(true);
    try {
      localStorage.setItem('author', formData.author);
      const { error } = await supabase.from('memos').insert([
        {
          company_name: formData.company_name,
          representative_name: formData.representative_name,
          title: formData.title,
          author: formData.author,
          content: formData.content,
        },
      ]);
      if (error) throw error;
      setModalOpen(false);
      router.push('/');
    } catch (error) {
      console.error('Error creating memo:', error);
      alert('메모 등록에 실패했습니다.');
      setIsSubmitting(false);
      setModalOpen(false);
    }
  };

  return (
    <div className={styles.container}>
      <button type="button" onClick={() => router.back()} className={styles.backButton}>
        ← 돌아가기
      </button>

      <form className={styles.form} onSubmit={handleSubmit}>
        <h1 className={styles.title}>새 메모 등록</h1>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="company_name" className={styles.label}>기업명</label>
            <input
              type="text"
              id="company_name"
              name="company_name"
              value={formData.company_name}
              onChange={handleInputChange}
              placeholder="기업명을 입력하세요"
              className={styles.input}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="representative_name" className={styles.label}>대표자명</label>
            <input
              type="text"
              id="representative_name"
              name="representative_name"
              value={formData.representative_name}
              onChange={handleInputChange}
              placeholder="대표자명을 입력하세요"
              className={styles.input}
            />
          </div>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="title" className={styles.label}>
            제목 <span className={styles.required}>*</span>
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="메모 제목을 입력하세요"
            required
            className={styles.input}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="author" className={styles.label}>작성자</label>
          <input
            type="text"
            id="author"
            name="author"
            value={formData.author}
            onChange={handleInputChange}
            placeholder="작성자 이름을 입력하세요"
            className={styles.input}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="content" className={styles.label}>
            내용 <span className={styles.required}>*</span>
          </label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleInputChange}
            placeholder="내용을 입력하세요..."
            rows={15}
            required
            className={styles.textarea}
          />
        </div>

        <div className={styles.actions}>
          <button type="button" onClick={() => router.back()} className={styles.cancelButton}>
            취소
          </button>
          <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
            {isSubmitting ? '등록 중...' : '메모 등록'}
          </button>
        </div>
      </form>

      <ConfirmModal
        isOpen={modalOpen}
        title="메모 등록"
        message={`다음 내용으로 메모를 등록하시겠습니까?

기업명: ${formData.company_name || '미지정'}
대표자명: ${formData.representative_name || '미지정'}
제목: ${formData.title}
작성자: ${formData.author || '미지정'}`}
        confirmText="등록"
        cancelText="취소"
        onConfirm={handleConfirmSubmit}
        onCancel={() => setModalOpen(false)}
      />
    </div>
  );
}
