'use client';

import { useState } from 'react';
import styles from './PasswordModal.module.css';

const PASSWORD = 'xnvlt12';

export function checkAuth() {
  if (typeof window === 'undefined') return false;
  return sessionStorage.getItem('plan_auth') === 'true';
}

export function setAuth() {
  sessionStorage.setItem('plan_auth', 'true');
}

interface PasswordModalProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export default function PasswordModal({ onSuccess, onCancel }: PasswordModalProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === PASSWORD) {
      setAuth();
      onSuccess();
    } else {
      setError(true);
      setPassword('');
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2 className={styles.title}>비밀번호 입력</h2>
        <p className={styles.desc}>이 페이지에 접근하려면 비밀번호가 필요합니다.</p>
        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            type="password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(false); }}
            placeholder="비밀번호를 입력하세요"
            className={`${styles.input} ${error ? styles.inputError : ''}`}
            autoFocus
          />
          {error && <p className={styles.errorText}>비밀번호가 올바르지 않습니다.</p>}
          <div className={styles.actions}>
            <button type="button" onClick={onCancel} className={styles.cancelButton}>취소</button>
            <button type="submit" className={styles.submitButton}>확인</button>
          </div>
        </form>
      </div>
    </div>
  );
}
