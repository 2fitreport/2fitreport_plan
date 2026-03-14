'use client';

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import styles from './page.module.css';
import { supabase } from '@/lib/supabase';
import ConfirmModal from '@/app/components/ConfirmModal';
import EditModal from '@/app/components/EditModal';

interface PostData {
  id: string;
  title: string;
  content: string;
  date: string;
  start_date: string;
  end_date: string;
  author: string;
  created_at: string;
  updated_at: string;
  status: string;
}

interface Comment {
  id: string;
  post_id: string;
  content: string;
  created_at: string;
}

// 초기 더미 데이터 (로딩 실패 시 사용)
const DUMMY_POSTS: Record<string, PostData> = {
  '1': {
    id: '1',
    title: '영업 현황 보고',
    date: '2025-03-11',
    start_date: '2025-03-11',
    end_date: '2025-03-11',
    author: '',
    status: '진행중',
    content: `오늘의 영업 현황을 정리했습니다.

신규 고객 5명 추가
- A사: 기계류 납품 계약
- B사: IT 솔루션 도입 협의
- C사: 컨설팅 서비스 요청

계약 완료 3건
- 기존 고객 X사 연장계약 체결
- 신규 프로젝트 Y사 계약
- 유지보수 계약 Z사 갱신

다음 주 예정:
- 3월 15일: A사 미팅 (13:00)
- 3월 17일: B사 프리젠테이션 (10:00)
- 3월 18일: C사 계약 체결 (15:00)`,
    created_at: new Date(2025, 2, 11, 9, 30).toISOString(),
    updated_at: new Date(2025, 2, 11, 9, 30).toISOString(),
  },
  '2': {
    id: '2',
    title: '3월 매출 분석',
    date: '2025-03-11',
    start_date: '2025-03-11',
    end_date: '2025-03-11',
    author: '',
    status: '검수',
    content: `3월 중순 매출 분석 결과: 전월 대비 15% 증가

상품별 매출 현황:
- 상품A: 3,000만원 (35%)
- 상품B: 2,500만원 (30%)
- 상품C: 1,800만원 (20%)
- 기타 상품: 1,200만원 (15%)

지역별 성과:
- 서울: 4,500만원
- 경기: 2,800만원
- 부산: 1,200만원

주요 인사이트:
- 온라인 채널 성장세 지속 (+25%)
- 기업 고객층 확대 중
- 시즈널 제품 매출 호조`,
    created_at: new Date(2025, 2, 11, 10, 15).toISOString(),
    updated_at: new Date(2025, 2, 11, 10, 15).toISOString(),
  },
  '3': {
    id: '3',
    title: '고객 미팅 기록',
    date: '2025-03-11',
    start_date: '2025-03-11',
    end_date: '2025-03-11',
    author: '',
    status: '완료',
    content: `A사 담당자와 협력 방안에 대해 논의했습니다.

회의 주요 내용:
- 2025년 협력 계획 수립
- 신규 상품 라인업 소개
- 가격 정책 및 지원 방안 협의

합의 사항:
- 월간 정기 미팅 개최 (매월 둘째 주 화요일)
- 분기별 전략 회의 진행
- 신규 상품 시범 공급 (4월부터)

차기 회의:
- 일시: 3월 15일 오후 3시
- 장소: A사 서울 지사 3층 회의실
- 주요 안건: 분기별 성과 검토, Q2 계획 수립`,
    created_at: new Date(2025, 2, 11, 14, 0).toISOString(),
    updated_at: new Date(2025, 2, 11, 14, 0).toISOString(),
  },
  '4': {
    id: '4',
    title: '새 프로젝트 킥오프',
    date: '2025-03-10',
    start_date: '2025-03-10',
    end_date: '2025-03-10',
    author: '',
    status: '진행중',
    content: `새로운 프로젝트의 킥오프 미팅이 성공적으로 진행되었습니다.

프로젝트 개요:
- 프로젝트명: 디지털 마케팅 플랫폼 구축
- 추진 기간: 2025년 3월 ~ 8월
- 예산: 5억원
- 담당팀: IT개발팀 + 마케팅팀

주요 추진 일정:
- 3월: 요구사항 분석 및 설계
- 4월: 개발 본격 시작
- 6월: 베타 테스트 진행
- 8월: 정식 런칭

팀 구성:
- PM(프로젝트 매니저): 김영희
- 개발 리드: 박준호
- 디자인 리드: 이수민
- QA 리드: 정지훈`,
    created_at: new Date(2025, 2, 10, 11, 0).toISOString(),
    updated_at: new Date(2025, 2, 10, 11, 0).toISOString(),
  },
  '5': {
    id: '5',
    title: '마케팅 전략 회의',
    date: '2025-03-11',
    start_date: '2025-03-11',
    end_date: '2025-03-11',
    author: '',
    status: '보류',
    content: `마케팅 팀과 전략 회의 예정\n\n주요 안건:\n- Q2 마케팅 전략\n- 소셜 미디어 캠페인\n- 광고 예산 배분\n\n검토 중...`,
    created_at: new Date(2025, 2, 11, 15, 30).toISOString(),
    updated_at: new Date(2025, 2, 11, 15, 30).toISOString(),
  },
};

function PostDetailContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const postId = params?.id as string;
  const isMeeting = searchParams.get('type') === 'meeting';
  const [post, setPost] = useState<PostData | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [modalConfig, setModalConfig] = useState<{
    title: string;
    message: string;
    confirmText: string;
    onConfirm: () => void;
    isDangerous?: boolean;
  } | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const table = isMeeting ? 'meetings' : 'posts';
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .eq('id', postId)
          .single();

        if (error) throw error;
        setPost(data);
      } catch (error) {
        console.error('Error fetching post:', error);
        // 로드 실패 시 더미 데이터 사용
        setPost(DUMMY_POSTS[postId] || null);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId, isMeeting]);

  // 댓글 가져오기
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const commentTable = isMeeting ? 'meeting_comments' : 'comments';
        const idField = isMeeting ? 'meeting_id' : 'post_id';

        const { data, error } = await supabase
          .from(commentTable)
          .select('*')
          .eq(idField, postId)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setComments(data || []);
      } catch (error) {
        console.error('Error fetching comments:', error);
      }
    };

    if (postId) {
      fetchComments();
    }
  }, [postId, isMeeting]);

  const openStatusChangeModal = (newStatus: string) => {
    const statusMessages: Record<string, string> = {
      검수: '이 일정을 검수 상태로 변경하시겠습니까?',
      완료: '이 일정을 완료 상태로 변경하시겠습니까?',
      진행중: '이 일정을 진행중 상태로 복구하시겠습니까?',
      보류: '이 일정을 보류 상태로 변경하시겠습니까?',
    };

    setModalConfig({
      title: `상태 변경`,
      message: statusMessages[newStatus],
      confirmText: '변경',
      onConfirm: () => handleStatusChange(newStatus),
    });
    setModalOpen(true);
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!post) return;

    try {
      const { error } = await supabase
        .from('posts')
        .update({ status: newStatus })
        .eq('id', postId);

      if (error) throw error;
      setPost({ ...post, status: newStatus });
      setModalOpen(false);
      router.push('/');
    } catch (error) {
      console.error('Error updating status:', error);
      alert('상태 변경에 실패했습니다.');
    }
  };

  const openDeleteModal = () => {
    setModalConfig({
      title: '일정 삭제',
      message: '이 일정을 삭제하시겠습니까? 삭제된 일정은 복구할 수 없습니다.',
      confirmText: '삭제',
      onConfirm: handleDelete,
      isDangerous: true,
    });
    setModalOpen(true);
  };

  const handleDelete = async () => {
    try {
      const table = isMeeting ? 'meetings' : 'posts';
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', postId);

      if (error) throw error;
      setModalOpen(false);
      router.push('/');
    } catch (error) {
      console.error('Error deleting item:', error);
      const itemType = isMeeting ? '회의' : '일정';
      alert(`${itemType} 삭제에 실패했습니다.`);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !post) return;

    try {
      const commentTable = isMeeting ? 'meeting_comments' : 'comments';
      const idField = isMeeting ? 'meeting_id' : 'post_id';

      const { data, error } = await supabase
        .from(commentTable)
        .insert([
          {
            [idField]: postId,
            content: newComment,
          },
        ])
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
      const commentTable = isMeeting ? 'meeting_comments' : 'comments';
      const { error } = await supabase
        .from(commentTable)
        .delete()
        .eq('id', commentId);

      if (error) throw error;
      setComments(comments.filter((c) => c.id !== commentId));
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('댓글 삭제에 실패했습니다.');
    }
  };

  const handleEditSave = async (
    newTitle: string,
    newStartDate: string,
    newEndDate: string,
    newAuthor: string,
    newContent: string
  ) => {
    if (!post) return;

    const endDate = newEndDate || newStartDate;
    const table = isMeeting ? 'meetings' : 'posts';

    try {
      const updateData: any = {
        title: newTitle,
        start_date: newStartDate,
        end_date: endDate,
        author: newAuthor,
        date: newStartDate,
        content: newContent,
      };

      if (!isMeeting) {
        updateData.status = post.status;
      }

      const { error } = await supabase
        .from(table)
        .update(updateData)
        .eq('id', postId);

      if (error) throw error;
      setPost({
        ...post,
        title: newTitle,
        date: newStartDate,
        start_date: newStartDate,
        end_date: endDate,
        author: newAuthor,
        content: newContent,
      });
      setEditModalOpen(false);
      setModalConfig({
        title: '수정 완료',
        message: '글이 수정되었습니다.',
        confirmText: '확인',
        onConfirm: () => router.push('/'),
      });
      setModalOpen(true);
    } catch (error) {
      console.error('Error updating post:', error);
      alert('글 수정에 실패했습니다.');
    }
  };

  if (loading) {
    return (
      <div className={styles.notFound}>
        <h2>로딩 중...</h2>
      </div>
    );
  }

  if (!post) {
    return (
      <div className={styles.notFound}>
        <h2>게시물을 찾을 수 없습니다</h2>
        <div className={styles.backButtons}>
          <button
            type="button"
            onClick={() => router.back()}
            className={styles.backButton}
          >
            ← 게시판으로 돌아가기
          </button>
          <Link href={isMeeting ? '/?tab=회의' : '/?tab=일정'} className={styles.backButton}>
            ← 달력으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.backButtons}>
        <button
          type="button"
          onClick={() => router.back()}
          className={styles.backButton}
        >
          ← 게시판으로 돌아가기
        </button>
        <Link href={isMeeting ? '/?tab=회의' : '/?tab=일정'} className={styles.backButton}>
          ← 달력으로 돌아가기
        </Link>
      </div>

      <article className={styles.article}>
        <header className={styles.articleHeader}>
          <h1 className={styles.title}>{post.title}</h1>
          <div className={styles.meta}>
            <span className={styles.date}>{formatDate(post.created_at)}</span>
            <span className={styles.separator}>•</span>
            <span className={styles.dateLabel}>
              {post.start_date === post.end_date
                ? post.start_date
                : `${post.start_date} ~ ${post.end_date}`}
            </span>
            {post.author && (
              <>
                <span className={styles.separator}>•</span>
                <span className={styles.author}>{post.author}</span>
              </>
            )}
            <span className={styles.separator}>•</span>
            <span
              className={`${styles.statusBadge} ${
                post.status === '진행중'
                  ? styles.statusPending
                  : post.status === '검수'
                  ? styles.statusReview
                  : post.status === '완료'
                  ? styles.statusDone
                  : styles.statusHold
              }`}
            >
              {post.status === '완료' ? '완료' : post.status}
            </span>
          </div>
        </header>

        <div className={styles.content}>
          {post.content.split('\n').map((line: string, index: number) => (
            line.trim() === '' ? (
              <br key={index} />
            ) : (
              <p key={index} className={styles.paragraph}>
                {line}
              </p>
            )
          ))}
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
            {!isMeeting && (
              <>
                {post.status === '진행중' && (
                  <>
                    <button
                      type="button"
                      className={styles.reviewButton}
                      onClick={() => openStatusChangeModal('검수')}
                    >
                      검수
                    </button>
                    <button
                      type="button"
                      className={styles.holdButton}
                      onClick={() => openStatusChangeModal('보류')}
                    >
                      보류
                    </button>
                  </>
                )}
                {post.status === '검수' && (
                  <>
                    <button
                      type="button"
                      className={styles.doneButton}
                      onClick={() => openStatusChangeModal('완료')}
                    >
                      완료
                    </button>
                    <button
                      type="button"
                      className={styles.holdButton}
                      onClick={() => openStatusChangeModal('보류')}
                    >
                      보류
                    </button>
                  </>
                )}
                {post.status === '완료' && null}
                {post.status === '보류' && (
                  <button
                    type="button"
                    className={styles.reviewButton}
                    onClick={() => openStatusChangeModal('진행중')}
                  >
                    진행중
                  </button>
                )}
              </>
            )}
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

      <EditModal
        isOpen={editModalOpen}
        title={post.title}
        startDate={post.start_date}
        endDate={post.end_date}
        author={post.author}
        content={post.content}
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

export default function PostDetail() {
  return (
    <Suspense fallback={<div>로딩 중...</div>}>
      <PostDetailContent />
    </Suspense>
  );
}
