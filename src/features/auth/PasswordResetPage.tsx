import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../../services/authService';

type Step = 1 | 2;

export default function PasswordResetPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>(1);
  const [phone, setPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleRequestReset(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authService.requestPasswordReset(phone);
      setStep(2);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      setError(msg ?? '인증번호 발송에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirmReset(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authService.confirmPasswordReset(phone, otpCode, newPassword);
      navigate('/login', { state: { message: '비밀번호가 변경되었습니다. 다시 로그인해주세요.' } });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      setError(msg ?? '비밀번호 변경에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>비밀번호 찾기</h2>
        <p style={styles.subtitle}>
          등록된 전화번호로 인증번호를 받아 새 비밀번호를 설정합니다.
        </p>

        {step === 1 && (
          <form onSubmit={handleRequestReset}>
            <div style={styles.field}>
              <label style={styles.label}>전화번호</label>
              <input
                style={styles.input}
                type="tel"
                placeholder="010-1234-5678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
            {error && <p style={styles.error}>{error}</p>}
            <button style={styles.button} type="submit" disabled={loading}>
              {loading ? '발송 중...' : '인증번호 받기'}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleConfirmReset}>
            <div style={styles.field}>
              <label style={styles.label}>인증번호</label>
              <input
                style={styles.input}
                type="text"
                placeholder="6자리 숫자"
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                required
              />
              <small style={styles.hint}>{phone}으로 발송된 6자리 인증번호를 입력하세요.</small>
            </div>
            <div style={styles.field}>
              <label style={styles.label}>새 비밀번호</label>
              <input
                style={styles.input}
                type="password"
                placeholder="영문 대소문자 + 숫자 + 특수문자, 8자 이상"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            {error && <p style={styles.error}>{error}</p>}
            <button style={styles.button} type="submit" disabled={loading}>
              {loading ? '처리 중...' : '비밀번호 변경'}
            </button>
            <button
              type="button"
              style={styles.linkButton}
              onClick={() => { setStep(1); setError(''); }}
            >
              전화번호 다시 입력
            </button>
          </form>
        )}

        <div style={styles.footer}>
          <Link to="/login" style={styles.link}>로그인으로 돌아가기</Link>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
  },
  card: {
    backgroundColor: '#fff',
    padding: '40px',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    width: '100%',
    maxWidth: '420px',
  },
  title: {
    margin: '0 0 8px',
    fontSize: '24px',
    fontWeight: 600,
    color: '#1a1a1a',
  },
  subtitle: {
    margin: '0 0 24px',
    fontSize: '14px',
    color: '#666',
    lineHeight: 1.5,
  },
  field: {
    marginBottom: '16px',
  },
  label: {
    display: 'block',
    marginBottom: '6px',
    fontSize: '14px',
    fontWeight: 500,
    color: '#333',
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    boxSizing: 'border-box',
  },
  hint: {
    display: 'block',
    marginTop: '4px',
    fontSize: '12px',
    color: '#888',
  },
  button: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#1976d2',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '15px',
    fontWeight: 500,
    cursor: 'pointer',
    marginBottom: '8px',
  },
  linkButton: {
    width: '100%',
    padding: '10px',
    backgroundColor: 'transparent',
    color: '#666',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    cursor: 'pointer',
  },
  error: {
    color: '#d32f2f',
    fontSize: '13px',
    marginBottom: '12px',
  },
  footer: {
    marginTop: '20px',
    textAlign: 'center',
  },
  link: {
    color: '#1976d2',
    fontSize: '14px',
    textDecoration: 'none',
  },
};
