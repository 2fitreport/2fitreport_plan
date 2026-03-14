'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import styles from './page.module.css';
import { supabase } from '@/lib/supabase';
import ConfirmModal from '@/app/components/ConfirmModal';
import MemoEditModal from '@/app/components/MemoEditModal';

interface MemoData {
  id: string;
  company_name: string;
  representative_name: string;
  title: string;
  content: string;
  author: string;
  created_at: string;
  updated_at: string;
}

interface Comment {
  id: string;
  memo_id: string;
  content: string;
  created_at: string;
}

export default function MemoDetail() {
  const params = useParams();
  const router = useRouter();
  const memoId = params?.id as string;

  const [memo, setMemo] = useState<MemoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState<{
    title: string;
    message: string;
    confirmText: string;
    onConfirm: () => void;
    isDangerous?: boolean;
  } | null>(null);

  useEffect(() => {
    const fetchMemo = async () => {
      try {
        const { data, error } = await supabase
          .from('memos')
          .select('*')
          .eq('id', memoId)
          .single();
        if (error) throw error;
        setMemo(data);
      } catch (error) {
        console.error('Error fetching memo:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMemo();
  }, [memoId]);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const { data, error } = await supabase
          .from('memo_comments')
          .select('*')
          .eq('memo_id', memoId)
          .order('created_at', { ascending: false });
        if (error) throw error;
        setComments(data || []);
      } catch (error) {
        console.error('Error fetching comments:', error);
      }
    };
    if (memoId) fetchComments();
  }, [memoId]);

  const openDeleteModal = () => {
    setModalConfig({
      title: '메모 삭제',
      message: '이 메모를 삭제하시겠습니까? 삭제된 메모는 복구할 수 없습니다.',
      confirmText: '삭제',
      onConfirm: handleDelete,
      isDangerous: true,
    });
    setModalOpen(true);
  };

  const handleDelete = async () => {
    try {
      const { error } = await supabase.from('memos').delete().eq('id', memoId);
      if (error) throw error;
      setModalOpen(false);
      router.push('/');
    } catch (error) {
      console.error('Error deleting memo:', error);
      alert('메모 삭제에 실패했습니다.');
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !memo) return;
    try {
      const { data, error } = await supabase
        .from('memo_comments')
        .insert([{ memo_id: memoId, content: newComment }])
        .select();
      if (error) throw error;
      if (data) {
        setComments([data[0], ...comments]);
        setNewComment('');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('댓글 작성에 실패했습니다.');
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      const { error } = await supabase.from('memo_comments').delete().eq('id', commentId);
      if (error) throw error;
      setComments(comments.filter((c) => c.id !== commentId));
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('댓글 삭제에 실패했습니다.');
    }
  };

  const handleEditSave = async (
    newCompanyName: string,
    newRepresentativeName: string,
    newTitle: string,
    newAuthor: string,
    newContent: string
  ) => {
    if (!memo) return;
    try {
      const { error } = await supabase
        .from('memos')
        .update({
          company_name: newCompanyName,
          representative_name: newRepresentativeName,
          title: newTitle,
          author: newAuthor,
          content: newContent,
        })
        .eq('id', memoId);
      if (error) throw error;
      setMemo({
        ...memo,
        company_name: newCompanyName,
        representative_name: newRepresentativeName,
        title: newTitle,
        author: newAuthor,
        content: newContent,
      });
      setEditModalOpen(false);
      setModalConfig({
        title: '수정 완료',
        message: '메모가 수정되었습니다.',
        confirmText: '확인',
        onConfirm: () => router.push('/'),
      });
      setModalOpen(true);
    } catch (error) {
      console.error('Error updating memo:', error);
      alert('메모 수정에 실패했습니다.');
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return <div className={styles.notFound}><h2>로딩 중...</h2></div>;
  }

  if (!memo) {
    return (
      <div className={styles.notFound}>
        <h2>메모를 찾을 수 없습니다</h2>
        <Link href="/" className={styles.backButton}>← 목록으로 돌아가기</Link>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.backButtons}>
        <button type="button" onClick={() => router.back()} className={styles.backButton}>
          ← 목록으로 돌아가기
        </button>
        <Link href="/" className={styles.backButton}>← 홈으로 돌아가기</Link>
      </div>

      <article className={styles.article}>
        <header className={styles.articleHeader}>
          <h1 className={styles.title}>{memo.title}</h1>
          <div className={styles.meta}>
            {memo.company_name && (
              <>
                <span className={styles.metaBadge}>{memo.company_name}</span>
                <span className={styles.separator}>•</span>
              </>
            )}
            {memo.representative_name && (
              <>
                <span className={styles.metaBadge}>{memo.representative_name}</span>
                <span className={styles.separator}>•</span>
              </>
            )}
            <span className={styles.date}>{formatDate(memo.created_at)}</span>
            {memo.author && (
              <>
                <span className={styles.separator}>•</span>
                <span className={styles.author}>{memo.author}</span>
              </>
            )}
          </div>
        </header>

        <div className={styles.content}>
          {memo.content.split('\n').map((line: string, index: number) =>
            line.trim() === '' ? (
              <br key={index} />
            ) : (
              <p key={index} className={styles.paragraph}>{line}</p>
            )
          )}
        </div>

        <section className={styles.commentsSection}>
          <h3 className={styles.commentsTitle}>댓글 ({comments.length})</h3>
          <div className={styles.commentForm}>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="댓글을 입력하세요..."
              className={styles.commentInput}
              rows={3}
            />
            <button
              type="button"
              onClick={handleAddComment}
              disabled={!newComment.trim()}
              className={styles.commentSubmitButton}
            >
              댓글 작성
            </button>
          </div>

          <div className={styles.commentsList}>
            {comments.length === 0 ? (
              <p className={styles.noComments}>아직 댓글이 없습니다.</p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className={styles.commentItem}>
                  <div className={styles.commentHeader}>
                    <span className={styles.commentDate}>
                      {new Date(comment.created_at).toLocaleDateString('ko-KR', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteComment(comment.id)}
                      className={styles.commentDeleteButton}
                    >
                      삭제
                    </button>
                  </div>
                  <p className={styles.commentContent}>{comment.content}</p>
                </div>
              ))
            )}
          </div>
        </section>

        <footer className={styles.footer}>
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.editButton}
              onClick={() => setEditModalOpen(true)}
            >
              수정
            </button>
            <button
              type="button"
              className={styles.deleteButton}
              onClick={openDeleteModal}
            >
              삭제
            </button>
          </div>
        </footer>
      </article>

      <MemoEditModal
        isOpen={editModalOpen}
        companyName={memo.company_name || ''}
        representativeName={memo.representative_name || ''}
        title={memo.title}
        author={memo.author || ''}
        content={memo.content || ''}
        onSave={handleEditSave}
        onCancel={() => setEditModalOpen(false)}
      />

      {modalConfig && (
        <ConfirmModal
          isOpen={modalOpen}
          title={modalConfig.title}
          message={modalConfig.message}
          confirmText={modalConfig.confirmText}
          cancelText="취소"
          onConfirm={modalConfig.onConfirm}
          onCancel={() => setModalOpen(false)}
          isDangerous={modalConfig.isDangerous}
        />
      )}
    </div>
  );
}
