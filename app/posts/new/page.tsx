'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import { supabase } from '@/lib/supabase';
import ConfirmModal from '@/app/components/ConfirmModal';

export default function NewPost() {
  const router = useRouter();
  const today = new Date().toISOString().split('T')[0];
  const [formData, setFormData] = useState({
    title: '',
    start_date: today,
    end_date: '',
    author: '',
    content: '',
    status: '진행중',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const savedAuthor = localStorage.getItem('author') || '';
    setFormData((prev) => ({
      ...prev,
      author: savedAuthor,
    }));
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setModalOpen(true);
  };

  const handleConfirmSubmit = async () => {
    setIsSubmitting(true);

    try {
      // 작성자 localStorage에 저장
      localStorage.setItem('author', formData.author);

      const endDate = formData.end_date || formData.start_date;

      const { data, error } = await supabase
        .from('posts')
        .insert([
          {
            title: formData.title,
            content: formData.content,
            date: formData.start_date,
            start_date: formData.start_date,
            end_date: endDate,
            author: formData.author,
            status: formData.status,
          },
        ]);

      if (error) throw error;

      // 성공 후 홈으로 이동
      setModalOpen(false);
      router.push('/');
    } catch (error) {
      console.error('Error creating post:', error);
      alert('일정 등록에 실패했습니다.');
      setIsSubmitting(false);
      setModalOpen(false);
    }
  };

  return (
    <div className={styles.container}>
      <button
        type="button"
        onClick={() => router.back()}
        className={styles.backButton}
      >
        ← 돌아가기
      </button>

      <form className={styles.form} onSubmit={handleSubmit}>
        <h1 className={styles.title}>새 일정 등록</h1>

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
            placeholder="일정 제목을 입력하세요"
            required
            className={styles.input}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="author" className={styles.label}>
            작성자
          </label>
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

        <div className={styles.dateRange}>
          <div className={styles.formGroup} style={{ flex: 1 }}>
            <label htmlFor="start_date" className={styles.label}>
              시작일 <span className={styles.required}>*</span>
            </label>
            <input
              type="date"
              id="start_date"
              name="start_date"
              value={formData.start_date}
              onChange={handleInputChange}
              required
              className={styles.input}
            />
          </div>

          <div style={{ padding: '0 8px', display: 'flex', alignItems: 'flex-end', marginBottom: '0' }}>
            ~
          </div>

          <div className={styles.formGroup} style={{ flex: 1 }}>
            <label htmlFor="end_date" className={styles.label}>
              종료일
            </label>
            <input
              type="date"
              id="end_date"
              name="end_date"
              value={formData.end_date}
              onChange={handleInputChange}
              placeholder="선택 사항"
              className={styles.input}
            />
            <p className={styles.hint}>
              종료일을 지정하지 않으면 시작일과 같습니다.
            </p>
          </div>
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
          <p className={styles.hint}>
            줄바꿈을 이용하여 내용을 정리할 수 있습니다.
          </p>
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            onClick={() => router.back()}
            className={styles.cancelButton}
          >
            취소
          </button>
          <button
            type="submit"
            className={styles.submitButton}
            disabled={isSubmitting}
          >
            {isSubmitting ? '등록 중...' : '일정 등록'}
          </button>
        </div>
      </form>

      <ConfirmModal
        isOpen={modalOpen}
        title="일정 등록"
        message={`다음 내용으로 일정을 등록하시겠습니까?

제목: ${formData.title}
작성자: ${formData.author || '미지정'}
시작일: ${formData.start_date}
종료일: ${formData.end_date || formData.start_date}`}
        confirmText="등록"
        cancelText="취소"
        onConfirm={handleConfirmSubmit}
        onCancel={() => setModalOpen(false)}
      />
    </div>
  );
}
