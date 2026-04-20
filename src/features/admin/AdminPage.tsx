import { useState, useEffect, useCallback } from 'react';
import adminService, {
  type TeacherSummary,
  type StudentSummary,
  type ParentSummary,
  type ClassSummary,
} from '../../services/adminService';

type Tab = 'teachers' | 'students' | 'parents' | 'classes';

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>('teachers');

  return (
    <div>
      <h2 style={s.pageTitle}>관리자</h2>
      <div style={s.tabs}>
        {(['teachers', 'students', 'parents', 'classes'] as Tab[]).map(t => (
          <button
            key={t}
            style={{ ...s.tab, ...(tab === t ? s.tabActive : {}) }}
            onClick={() => setTab(t)}
          >
            {{ teachers: '교사', students: '학생', parents: '학부모', classes: '반 관리' }[t]}
          </button>
        ))}
      </div>
      <div style={s.content}>
        {tab === 'teachers' && <TeachersTab />}
        {tab === 'students' && <StudentsTab />}
        {tab === 'parents' && <ParentsTab />}
        {tab === 'classes' && <ClassesTab />}
      </div>
    </div>
  );
}

// ─── 교사 탭 ─────────────────────────────────────────────

function TeachersTab() {
  const [teachers, setTeachers] = useState<TeacherSummary[]>([]);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [dept, setDept] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const load = useCallback(() => adminService.getTeachers().then(setTeachers), []);
  useEffect(() => { load(); }, [load]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await adminService.registerTeacher({ name, phone, department: dept || undefined });
      setName(''); setPhone(''); setDept('');
      load();
    } catch (err: unknown) {
      setError((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? '등록 실패');
    } finally { setLoading(false); }
  }

  return (
    <div style={s.twoCol}>
      <div>
        <h3 style={s.sectionTitle}>교사 등록</h3>
        <form onSubmit={handleSubmit}>
          <Field label="이름" value={name} onChange={setName} required />
          <Field label="전화번호" value={phone} onChange={setPhone} placeholder="010-1234-5678" required />
          <Field label="담당교과" value={dept} onChange={setDept} placeholder="수학 (선택)" />
          {error && <p style={s.error}>{error}</p>}
          <button style={s.btn} disabled={loading}>{loading ? '처리 중...' : '등록'}</button>
        </form>
      </div>
      <div>
        <h3 style={s.sectionTitle}>교사 목록 ({teachers.length}명)</h3>
        <table style={s.table}>
          <thead><tr>
            <Th>이름</Th><Th>전화번호</Th><Th>담당교과</Th><Th>활성화</Th>
          </tr></thead>
          <tbody>
            {teachers.map(t => (
              <tr key={t.id}>
                <Td>{t.name}</Td>
                <Td>{t.phone}</Td>
                <Td>{t.department ?? '-'}</Td>
                <Td><Badge active={t.activated} /></Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── 학생 탭 ─────────────────────────────────────────────

function StudentsTab() {
  const [students, setStudents] = useState<StudentSummary[]>([]);
  const [classes, setClasses] = useState<ClassSummary[]>([]);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [admYear, setAdmYear] = useState(String(new Date().getFullYear()));
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // 반배정 폼
  const [enrollStudentId, setEnrollStudentId] = useState('');
  const [enrollClassId, setEnrollClassId] = useState('');
  const [enrollStudentNum, setEnrollStudentNum] = useState('');
  const [enrollError, setEnrollError] = useState('');
  const [enrollLoading, setEnrollLoading] = useState(false);

  const year = new Date().getFullYear();
  const load = useCallback(() => Promise.all([
    adminService.getStudents().then(setStudents),
    adminService.getClasses(year).then(setClasses),
  ]), [year]);
  useEffect(() => { load(); }, [load]);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await adminService.registerStudent({ name, phone, admissionYear: Number(admYear) });
      setName(''); setPhone('');
      load();
    } catch (err: unknown) {
      setError((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? '등록 실패');
    } finally { setLoading(false); }
  }

  async function handleEnroll(e: React.FormEvent) {
    e.preventDefault();
    setEnrollError(''); setEnrollLoading(true);
    try {
      await adminService.enrollStudent(Number(enrollClassId), {
        studentId: Number(enrollStudentId),
        studentNum: Number(enrollStudentNum),
      });
      setEnrollStudentId(''); setEnrollClassId(''); setEnrollStudentNum('');
      load();
    } catch (err: unknown) {
      setEnrollError((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? '배정 실패');
    } finally { setEnrollLoading(false); }
  }

  return (
    <div>
      <div style={s.twoCol}>
        <div>
          <h3 style={s.sectionTitle}>학생 등록</h3>
          <form onSubmit={handleRegister}>
            <Field label="이름" value={name} onChange={setName} required />
            <Field label="전화번호" value={phone} onChange={setPhone} placeholder="010-1234-5678" required />
            <Field label="입학년도" value={admYear} onChange={setAdmYear} placeholder="2026" required />
            {error && <p style={s.error}>{error}</p>}
            <button style={s.btn} disabled={loading}>{loading ? '처리 중...' : '등록'}</button>
          </form>
        </div>
        <div>
          <h3 style={s.sectionTitle}>반 배정</h3>
          <form onSubmit={handleEnroll}>
            <label style={s.label}>학생 선택</label>
            <select style={s.select} value={enrollStudentId} onChange={e => setEnrollStudentId(e.target.value)} required>
              <option value="">-- 학생 선택 --</option>
              {students.filter(st => !st.currentEnrollment).map(st => (
                <option key={st.id} value={st.id}>{st.name} ({st.admissionYear}년 입학)</option>
              ))}
            </select>
            <label style={s.label}>반 선택</label>
            <select style={s.select} value={enrollClassId} onChange={e => setEnrollClassId(e.target.value)} required>
              <option value="">-- 반 선택 --</option>
              {classes.map(c => (
                <option key={c.id} value={c.id}>{c.grade}학년 {c.classNum}반</option>
              ))}
            </select>
            <Field label="학번" value={enrollStudentNum} onChange={setEnrollStudentNum} placeholder="1" required />
            {enrollError && <p style={s.error}>{enrollError}</p>}
            <button style={s.btn} disabled={enrollLoading}>{enrollLoading ? '처리 중...' : '배정'}</button>
          </form>
        </div>
      </div>
      <h3 style={{ ...s.sectionTitle, marginTop: 24 }}>학생 목록 ({students.length}명)</h3>
      <table style={s.table}>
        <thead><tr>
          <Th>ID</Th><Th>이름</Th><Th>전화번호</Th><Th>입학년도</Th><Th>소속 반</Th><Th>활성화</Th>
        </tr></thead>
        <tbody>
          {students.map(st => (
            <tr key={st.id}>
              <Td>{st.id}</Td>
              <Td>{st.name}</Td>
              <Td>{st.phone}</Td>
              <Td>{st.admissionYear}</Td>
              <Td>{st.currentEnrollment
                ? `${st.currentEnrollment.grade}학년 ${st.currentEnrollment.classNum}반 ${st.currentEnrollment.studentNum}번`
                : '미배정'}</Td>
              <Td><Badge active={st.activated} /></Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── 학부모 탭 ────────────────────────────────────────────

function ParentsTab() {
  const [parents, setParents] = useState<ParentSummary[]>([]);
  const [students, setStudents] = useState<StudentSummary[]>([]);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // 자녀 연결 폼
  const [linkStudentId, setLinkStudentId] = useState('');
  const [linkParentId, setLinkParentId] = useState('');
  const [relationship, setRelationship] = useState<'FATHER' | 'MOTHER' | 'GUARDIAN'>('FATHER');
  const [linkError, setLinkError] = useState('');
  const [linkLoading, setLinkLoading] = useState(false);

  const load = useCallback(() => Promise.all([
    adminService.getParents().then(setParents),
    adminService.getStudents().then(setStudents),
  ]), []);
  useEffect(() => { load(); }, [load]);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await adminService.registerParent({ name, phone });
      setName(''); setPhone('');
      load();
    } catch (err: unknown) {
      setError((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? '등록 실패');
    } finally { setLoading(false); }
  }

  async function handleLink(e: React.FormEvent) {
    e.preventDefault();
    setLinkError(''); setLinkLoading(true);
    try {
      await adminService.linkParentChild(Number(linkStudentId), {
        parentId: Number(linkParentId),
        relationship,
      });
      setLinkStudentId(''); setLinkParentId('');
      load();
    } catch (err: unknown) {
      setLinkError((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? '연결 실패');
    } finally { setLinkLoading(false); }
  }

  return (
    <div>
      <div style={s.twoCol}>
        <div>
          <h3 style={s.sectionTitle}>학부모 등록</h3>
          <form onSubmit={handleRegister}>
            <Field label="이름" value={name} onChange={setName} required />
            <Field label="전화번호" value={phone} onChange={setPhone} placeholder="010-1234-5678" required />
            {error && <p style={s.error}>{error}</p>}
            <button style={s.btn} disabled={loading}>{loading ? '처리 중...' : '등록'}</button>
          </form>
        </div>
        <div>
          <h3 style={s.sectionTitle}>자녀 연결</h3>
          <form onSubmit={handleLink}>
            <label style={s.label}>학부모 선택</label>
            <select style={s.select} value={linkParentId} onChange={e => setLinkParentId(e.target.value)} required>
              <option value="">-- 학부모 선택 --</option>
              {parents.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <label style={s.label}>학생 선택</label>
            <select style={s.select} value={linkStudentId} onChange={e => setLinkStudentId(e.target.value)} required>
              <option value="">-- 학생 선택 --</option>
              {students.map(st => <option key={st.id} value={st.id}>{st.name}</option>)}
            </select>
            <label style={s.label}>관계</label>
            <select style={s.select} value={relationship} onChange={e => setRelationship(e.target.value as typeof relationship)}>
              <option value="FATHER">부</option>
              <option value="MOTHER">모</option>
              <option value="GUARDIAN">보호자</option>
            </select>
            {linkError && <p style={s.error}>{linkError}</p>}
            <button style={s.btn} disabled={linkLoading}>{linkLoading ? '처리 중...' : '연결'}</button>
          </form>
        </div>
      </div>
      <h3 style={{ ...s.sectionTitle, marginTop: 24 }}>학부모 목록 ({parents.length}명)</h3>
      <table style={s.table}>
        <thead><tr>
          <Th>이름</Th><Th>전화번호</Th><Th>자녀</Th><Th>활성화</Th>
        </tr></thead>
        <tbody>
          {parents.map(p => (
            <tr key={p.id}>
              <Td>{p.name}</Td>
              <Td>{p.phone}</Td>
              <Td>{p.children.map(c => `${c.studentName}(${c.relationship})`).join(', ') || '-'}</Td>
              <Td><Badge active={p.activated} /></Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── 반 관리 탭 ───────────────────────────────────────────

function ClassesTab() {
  const year = new Date().getFullYear();
  const [classes, setClasses] = useState<ClassSummary[]>([]);
  const [teachers, setTeachers] = useState<TeacherSummary[]>([]);
  const [grade, setGrade] = useState('1');
  const [classNum, setClassNum] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // 담임 배정 폼
  const [homeroomClassId, setHomeroomClassId] = useState('');
  const [homeroomTeacherId, setHomeroomTeacherId] = useState('');
  const [homeroomError, setHomeroomError] = useState('');

  const load = useCallback(() => Promise.all([
    adminService.getClasses(year).then(setClasses),
    adminService.getTeachers().then(setTeachers),
  ]), [year]);
  useEffect(() => { load(); }, [load]);

  async function handleCreateClass(e: React.FormEvent) {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await adminService.createClass({ academicYear: year, grade: Number(grade), classNum: Number(classNum) });
      setClassNum('');
      load();
    } catch (err: unknown) {
      setError((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? '생성 실패');
    } finally { setLoading(false); }
  }

  async function handleAssignHomeroom(e: React.FormEvent) {
    e.preventDefault();
    setHomeroomError('');
    try {
      await adminService.assignHomeroom(Number(homeroomClassId), Number(homeroomTeacherId));
      setHomeroomClassId(''); setHomeroomTeacherId('');
      load();
    } catch (err: unknown) {
      setHomeroomError((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? '배정 실패');
    }
  }

  return (
    <div>
      <div style={s.twoCol}>
        <div>
          <h3 style={s.sectionTitle}>반 생성 ({year}학년도)</h3>
          <form onSubmit={handleCreateClass}>
            <label style={s.label}>학년</label>
            <select style={s.select} value={grade} onChange={e => setGrade(e.target.value)}>
              <option value="1">1학년</option>
              <option value="2">2학년</option>
              <option value="3">3학년</option>
            </select>
            <Field label="반 번호" value={classNum} onChange={setClassNum} placeholder="1" required />
            {error && <p style={s.error}>{error}</p>}
            <button style={s.btn} disabled={loading}>{loading ? '처리 중...' : '생성'}</button>
          </form>
        </div>
        <div>
          <h3 style={s.sectionTitle}>담임 배정</h3>
          <form onSubmit={handleAssignHomeroom}>
            <label style={s.label}>반 선택</label>
            <select style={s.select} value={homeroomClassId} onChange={e => setHomeroomClassId(e.target.value)} required>
              <option value="">-- 반 선택 --</option>
              {classes.map(c => (
                <option key={c.id} value={c.id}>{c.grade}학년 {c.classNum}반</option>
              ))}
            </select>
            <label style={s.label}>교사 선택</label>
            <select style={s.select} value={homeroomTeacherId} onChange={e => setHomeroomTeacherId(e.target.value)} required>
              <option value="">-- 교사 선택 --</option>
              {teachers.map(t => (
                <option key={t.id} value={t.id}>{t.name}{t.department ? ` (${t.department})` : ''}</option>
              ))}
            </select>
            {homeroomError && <p style={s.error}>{homeroomError}</p>}
            <button style={s.btn}>배정</button>
          </form>
        </div>
      </div>
      <h3 style={{ ...s.sectionTitle, marginTop: 24 }}>반 목록</h3>
      <table style={s.table}>
        <thead><tr>
          <Th>학년</Th><Th>반</Th><Th>담임</Th><Th>학생 수</Th>
        </tr></thead>
        <tbody>
          {classes.sort((a, b) => a.grade - b.grade || a.classNum - b.classNum).map(c => (
            <tr key={c.id}>
              <Td>{c.grade}학년</Td>
              <Td>{c.classNum}반</Td>
              <Td>{c.homeroomTeacher?.name ?? '미배정'}</Td>
              <Td>{c.studentCount}명</Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── 공통 컴포넌트 ────────────────────────────────────────

function Field({ label, value, onChange, placeholder, required }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; required?: boolean;
}) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={s.label}>{label}</label>
      <input
        style={s.input}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
      />
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th style={s.th}>{children}</th>;
}

function Td({ children }: { children: React.ReactNode }) {
  return <td style={s.td}>{children}</td>;
}

function Badge({ active }: { active: boolean }) {
  return (
    <span style={{ ...s.badge, backgroundColor: active ? '#e8f5e9' : '#fce4ec', color: active ? '#2e7d32' : '#c62828' }}>
      {active ? '활성' : '미활성'}
    </span>
  );
}

// ─── 스타일 ───────────────────────────────────────────────

const s: Record<string, React.CSSProperties> = {
  pageTitle: { margin: '0 0 16px', fontSize: 22, fontWeight: 600 },
  tabs: { display: 'flex', gap: 4, marginBottom: 24, borderBottom: '2px solid #e5e5e5' },
  tab: {
    padding: '8px 20px', border: 'none', background: 'none',
    cursor: 'pointer', fontSize: 14, color: '#666', borderBottom: '2px solid transparent', marginBottom: -2,
  },
  tabActive: { color: '#1976d2', borderBottom: '2px solid #1976d2', fontWeight: 600 },
  content: {},
  twoCol: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 },
  sectionTitle: { margin: '0 0 16px', fontSize: 15, fontWeight: 600, color: '#333' },
  label: { display: 'block', marginBottom: 4, fontSize: 13, fontWeight: 500, color: '#555' },
  input: {
    width: '100%', padding: '8px 10px', border: '1px solid #ddd',
    borderRadius: 4, fontSize: 14, boxSizing: 'border-box',
  },
  select: {
    width: '100%', padding: '8px 10px', border: '1px solid #ddd',
    borderRadius: 4, fontSize: 14, boxSizing: 'border-box', marginBottom: 12,
  },
  btn: {
    padding: '9px 20px', backgroundColor: '#1976d2', color: '#fff',
    border: 'none', borderRadius: 4, fontSize: 14, cursor: 'pointer', marginTop: 4,
  },
  error: { color: '#d32f2f', fontSize: 13, margin: '4px 0' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 13 },
  th: { padding: '8px 12px', backgroundColor: '#f5f5f5', borderBottom: '1px solid #e0e0e0', textAlign: 'left', fontWeight: 600 },
  td: { padding: '8px 12px', borderBottom: '1px solid #f0f0f0' },
  badge: { padding: '2px 8px', borderRadius: 12, fontSize: 12, fontWeight: 500 },
};
