'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import { supabase } from '@/lib/supabase';
import ConfirmModal from '@/app/components/ConfirmModal';

export default function NewPost() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    content: '',
    status: '진행중',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

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
      const { data, error } = await supabase
        .from('posts')
        .insert([
          {
            title: formData.title,
            content: formData.content,
            date: formData.date,
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
          <label htmlFor="date" className={styles.label}>
            날짜 <span className={styles.required}>*</span>
          </label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleInputChange}
            required
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
날짜: ${formData.date}`}
        confirmText="등록"
        cancelText="취소"
        onConfirm={handleConfirmSubmit}
        onCancel={() => setModalOpen(false)}
      />
    </div>
  );
}
