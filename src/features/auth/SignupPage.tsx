import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../../services/authService';
import type { SignupRequest } from '../../services/authService';

type RoleType = 'TEACHER' | 'STUDENT' | 'PARENT';

function SignupPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState<SignupRequest>({
    email: '',
    password: '',
    name: '',
    phone: '',
    role: 'TEACHER',
    roleDetail: {},
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleRoleDetailChange = (field: string, value: string | number) => {
    setForm((prev) => ({
      ...prev,
      roleDetail: { ...prev.roleDetail, [field]: value },
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다');
      return;
    }

    setLoading(true);
    try {
      await authService.signup(form);
      navigate('/login', { state: { message: '회원가입이 완료되었습니다. 로그인해주세요.' } });
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      setError(axiosError.response?.data?.message || '회원가입에 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  const roleLabels: Record<RoleType, string> = {
    TEACHER: '교사',
    STUDENT: '학생',
    PARENT: '학부모',
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>회원가입</h1>
        <p style={styles.subtitle}>SSCM 계정을 생성합니다</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          {error && <div style={styles.error}>{error}</div>}

          <div style={styles.field}>
            <label style={styles.label}>역할</label>
            <div style={styles.roleGroup}>
              {(Object.keys(roleLabels) as RoleType[]).map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => {
                    handleChange('role', role);
                    setForm((prev) => ({ ...prev, roleDetail: {} }));
                  }}
                  style={{
                    ...styles.roleButton,
                    ...(form.role === role ? styles.roleButtonActive : {}),
                  }}
                >
                  {roleLabels[role]}
                </button>
              ))}
            </div>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>이메일</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="email@school.ac.kr"
              required
              style={styles.input}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>이름</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="이름"
              required
              style={styles.input}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>연락처</label>
            <input
              type="tel"
              value={form.phone || ''}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="010-1234-5678"
              style={styles.input}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>비밀번호</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => handleChange('password', e.target.value)}
              placeholder="영문 대소문자 + 숫자 + 특수문자 8자 이상"
              required
              style={styles.input}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>비밀번호 확인</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="비밀번호를 다시 입력하세요"
              required
              style={styles.input}
            />
          </div>

          {form.role === 'TEACHER' && (
            <div style={styles.field}>
              <label style={styles.label}>담당 교과</label>
              <input
                type="text"
                value={(form.roleDetail?.department as string) || ''}
                onChange={(e) => handleRoleDetailChange('department', e.target.value)}
                placeholder="수학, 영어 등"
                style={styles.input}
              />
            </div>
          )}

          {form.role === 'STUDENT' && (
            <div style={styles.row}>
              <div style={styles.field}>
                <label style={styles.label}>학년</label>
                <input
                  type="number"
                  min={1}
                  max={3}
                  value={(form.roleDetail?.grade as number) || ''}
                  onChange={(e) => handleRoleDetailChange('grade', parseInt(e.target.value))}
                  required
                  style={styles.input}
                />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>반</label>
                <input
                  type="number"
                  min={1}
                  value={(form.roleDetail?.classNum as number) || ''}
                  onChange={(e) => handleRoleDetailChange('classNum', parseInt(e.target.value))}
                  required
                  style={styles.input}
                />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>번호</label>
                <input
                  type="number"
                  min={1}
                  value={(form.roleDetail?.studentNum as number) || ''}
                  onChange={(e) => handleRoleDetailChange('studentNum', parseInt(e.target.value))}
                  required
                  style={styles.input}
                />
              </div>
            </div>
          )}

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? '가입 중...' : '회원가입'}
          </button>
        </form>

        <p style={styles.link}>
          이미 계정이 있으신가요? <Link to="/login">로그인</Link>
        </p>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
    padding: '20px',
  },
  card: {
    backgroundColor: '#fff',
    padding: '40px',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    width: '100%',
    maxWidth: '480px',
  },
  title: {
    textAlign: 'center' as const,
    margin: '0 0 4px',
    fontSize: '24px',
    color: '#333',
  },
  subtitle: {
    textAlign: 'center' as const,
    margin: '0 0 24px',
    color: '#666',
    fontSize: '14px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '14px',
  },
  field: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '4px',
    flex: 1,
  },
  label: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#333',
  },
  input: {
    padding: '10px 12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
  },
  button: {
    padding: '12px',
    backgroundColor: '#4a90d9',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    cursor: 'pointer',
    marginTop: '8px',
  },
  error: {
    padding: '10px',
    backgroundColor: '#fee',
    color: '#c33',
    borderRadius: '4px',
    fontSize: '14px',
  },
  link: {
    textAlign: 'center' as const,
    marginTop: '16px',
    fontSize: '14px',
    color: '#666',
  },
  roleGroup: {
    display: 'flex',
    gap: '8px',
  },
  roleButton: {
    flex: 1,
    padding: '8px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    backgroundColor: '#fff',
    cursor: 'pointer',
    fontSize: '14px',
  },
  roleButtonActive: {
    backgroundColor: '#4a90d9',
    color: '#fff',
    borderColor: '#4a90d9',
  },
  row: {
    display: 'flex',
    gap: '12px',
  },
};

export default SignupPage;
