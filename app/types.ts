// 게시물 타입
export interface Post {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  content: string;
  createdAt: string;
  updatedAt: string;
}

// 선택된 날짜 상태
export interface SelectedDate {
  year: number;
  month: number;
  date: number;
}
