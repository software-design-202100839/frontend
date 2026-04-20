import { useState, useEffect } from 'react';
import adminService from '../../services/adminService';
import gradeService from '../../services/gradeService';
import type {
  TeacherSummary, StudentSummary, ParentSummary, ClassSummary,
  ClassEnrollment, ClassAssignment, Relationship,
} from '../../services/adminService';

type Tab = 'teachers' | 'students' | 'parents' | 'classes';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>('teachers');

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>관리자 페이지</h2>
      <div style={styles.tabs}>
        {(['teachers', 'students', 'parents', 'classes'] as Tab[]).map((tab) => (
          <button
            key={tab}
            style={{ ...styles.tab, ...(activeTab === tab ? styles.tabActive : {}) }}
            onClick={() => setActiveTab(tab)}
          >
            {{ teachers: '교사 관리', students: '학생 관리', parents: '학부모 관리', classes: '반 편성' }[tab]}
          </button>
        ))}
      </div>
      <div style={styles.panel}>
        {activeTab === 'teachers' && <TeacherTab />}
        {activeTab === 'students' && <StudentTab />}
        {activeTab === 'parents' && <ParentTab />}
        {activeTab === 'classes' && <ClassTab />}
      </div>
    </div>
  );
}

// ── 교사 관리 ──────────────────────────────────────

function TeacherTab() {
  const [teachers, setTeachers] = useState<TeacherSummary[]>([]);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function load() {
    const res = await adminService.getTeachers();
    setTeachers(res.content);
  }

  useEffect(() => { load(); }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await adminService.registerTeacher({ name, phone, department });
      setName(''); setPhone(''); setDepartment('');
      await load();
    } catch (err: unknown) {
      setError((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? '등록 실패');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit} style={styles.form}>
        <h3 style={styles.sectionTitle}>교사 등록</h3>
        <div style={styles.row}>
          <input style={styles.input} placeholder="이름" value={name} onChange={(e) => setName(e.target.value)} required />
          <input style={styles.input} placeholder="전화번호 (010-0000-0000)" value={phone} onChange={(e) => setPhone(e.target.value)} required />
          <input style={styles.input} placeholder="담당 교과 (예: 수학)" value={department} onChange={(e) => setDepartment(e.target.value)} />
          <button style={styles.addBtn} type="submit" disabled={loading}>등록</button>
        </div>
        {error && <p style={styles.error}>{error}</p>}
      </form>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>이름</th><th style={styles.th}>전화번호</th>
            <th style={styles.th}>교과</th><th style={styles.th}>현재 담당</th>
            <th style={styles.th}>활성화</th>
          </tr>
        </thead>
        <tbody>
          {teachers.map((t) => (
            <tr key={t.id} style={styles.tr}>
              <td style={styles.td}>{t.name}</td>
              <td style={styles.td}>{t.phone}</td>
              <td style={styles.td}>{t.department || '-'}</td>
              <td style={styles.td}>
                {t.currentClass
                  ? `${t.currentClass.grade}학년 ${t.currentClass.classNum}반${t.currentClass.isHomeroom ? ' (담임)' : ''}`
                  : '-'}
              </td>
              <td style={styles.td}>
                <span style={t.isActivated ? styles.badgeGreen : styles.badgeGray}>
                  {t.isActivated ? '활성화' : '미활성화'}
                </span>
              </td>
            </tr>
          ))}
          {teachers.length === 0 && (
            <tr><td colSpan={5} style={styles.empty}>등록된 교사가 없습니다.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

// ── 학생 관리 ──────────────────────────────────────

function StudentTab() {
  const [students, setStudents] = useState<StudentSummary[]>([]);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function load() {
    const res = await adminService.getStudents();
    setStudents(res.content);
  }

  useEffect(() => { load(); }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await adminService.registerStudent({ name, phone });
      setName(''); setPhone('');
      await load();
    } catch (err: unknown) {
      setError((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? '등록 실패');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit} style={styles.form}>
        <h3 style={styles.sectionTitle}>학생 등록</h3>
        <div style={styles.row}>
          <input style={styles.input} placeholder="이름" value={name} onChange={(e) => setName(e.target.value)} required />
          <input style={styles.input} placeholder="전화번호 (010-0000-0000)" value={phone} onChange={(e) => setPhone(e.target.value)} required />
          <button style={styles.addBtn} type="submit" disabled={loading}>등록</button>
        </div>
        {error && <p style={styles.error}>{error}</p>}
      </form>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>이름</th><th style={styles.th}>전화번호</th>
            <th style={styles.th}>현재 소속</th><th style={styles.th}>활성화</th>
          </tr>
        </thead>
        <tbody>
          {students.map((s) => (
            <tr key={s.id} style={styles.tr}>
              <td style={styles.td}>{s.name}</td>
              <td style={styles.td}>{s.phone}</td>
              <td style={styles.td}>
                {s.currentEnrollment
                  ? `${s.currentEnrollment.grade}학년 ${s.currentEnrollment.classNum}반 ${s.currentEnrollment.studentNum}번`
                  : '-'}
              </td>
              <td style={styles.td}>
                <span style={s.isActivated ? styles.badgeGreen : styles.badgeGray}>
                  {s.isActivated ? '활성화' : '미활성화'}
                </span>
              </td>
            </tr>
          ))}
          {students.length === 0 && (
            <tr><td colSpan={4} style={styles.empty}>등록된 학생이 없습니다.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

// ── 학부모 관리 ────────────────────────────────────

function ParentTab() {
  const [parents, setParents] = useState<ParentSummary[]>([]);
  const [students, setStudents] = useState<StudentSummary[]>([]);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [linkParentId, setLinkParentId] = useState<number | null>(null);
  const [linkStudentId, setLinkStudentId] = useState<number | ''>('');
  const [relationship, setRelationship] = useState<Relationship>('MOTHER');
  const [linkError, setLinkError] = useState('');

  async function load() {
    const [parentsRes, studentsRes] = await Promise.all([
      adminService.getParents(),
      adminService.getStudents(),
    ]);
    setParents(parentsRes.content);
    setStudents(studentsRes.content);
  }

  useEffect(() => { load(); }, []);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await adminService.registerParent({ name, phone });
      setName(''); setPhone('');
      await load();
    } catch (err: unknown) {
      setError((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? '등록 실패');
    } finally {
      setLoading(false);
    }
  }

  async function handleLink(e: React.FormEvent) {
    e.preventDefault();
    if (!linkParentId || !linkStudentId) return;
    setLinkError('');
    try {
      await adminService.addChildToParent(linkParentId, Number(linkStudentId), relationship);
      setLinkParentId(null);
      setLinkStudentId('');
      await load();
    } catch (err: unknown) {
      setLinkError((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? '연결 실패');
    }
  }

  return (
    <div>
      <form onSubmit={handleRegister} style={styles.form}>
        <h3 style={styles.sectionTitle}>학부모 등록</h3>
        <div style={styles.row}>
          <input style={styles.input} placeholder="이름" value={name} onChange={(e) => setName(e.target.value)} required />
          <input style={styles.input} placeholder="전화번호 (010-0000-0000)" value={phone} onChange={(e) => setPhone(e.target.value)} required />
          <button style={styles.addBtn} type="submit" disabled={loading}>등록</button>
        </div>
        {error && <p style={styles.error}>{error}</p>}
      </form>

      {linkParentId && (
        <form onSubmit={handleLink} style={{ ...styles.form, backgroundColor: '#f0f7ff', padding: '12px', borderRadius: '6px' }}>
          <h4 style={{ margin: '0 0 8px' }}>자녀 연결 — {parents.find((p) => p.id === linkParentId)?.name}</h4>
          <div style={styles.row}>
            <select style={styles.input} value={linkStudentId} onChange={(e) => setLinkStudentId(Number(e.target.value) || '')} required>
              <option value="">학생 선택</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>{s.name} {s.phone}</option>
              ))}
            </select>
            <select style={styles.input} value={relationship} onChange={(e) => setRelationship(e.target.value as Relationship)}>
              <option value="MOTHER">모</option>
              <option value="FATHER">부</option>
              <option value="GUARDIAN">보호자</option>
            </select>
            <button style={styles.addBtn} type="submit">연결</button>
            <button type="button" style={styles.cancelBtn} onClick={() => setLinkParentId(null)}>취소</button>
          </div>
          {linkError && <p style={styles.error}>{linkError}</p>}
        </form>
      )}

      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>이름</th><th style={styles.th}>전화번호</th>
            <th style={styles.th}>자녀</th><th style={styles.th}>활성화</th>
            <th style={styles.th}>자녀 연결</th>
          </tr>
        </thead>
        <tbody>
          {parents.map((p) => (
            <tr key={p.id} style={styles.tr}>
              <td style={styles.td}>{p.name}</td>
              <td style={styles.td}>{p.phone}</td>
              <td style={styles.td}>{p.children.map((c) => c.name).join(', ') || '-'}</td>
              <td style={styles.td}>
                <span style={p.isActivated ? styles.badgeGreen : styles.badgeGray}>
                  {p.isActivated ? '활성화' : '미활성화'}
                </span>
              </td>
              <td style={styles.td}>
                <button style={styles.smallBtn} onClick={() => setLinkParentId(p.id)}>+ 자녀 추가</button>
              </td>
            </tr>
          ))}
          {parents.length === 0 && (
            <tr><td colSpan={5} style={styles.empty}>등록된 학부모가 없습니다.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

// ── 반 편성 ────────────────────────────────────────

function ClassTab() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [classes, setClasses] = useState<ClassSummary[]>([]);
  const [teachers, setTeachers] = useState<TeacherSummary[]>([]);
  const [students, setStudents] = useState<StudentSummary[]>([]);
  const [selectedClass, setSelectedClass] = useState<ClassSummary | null>(null);
  const [enrollments, setEnrollments] = useState<ClassEnrollment[]>([]);
  const [assignments, setAssignments] = useState<ClassAssignment[]>([]);

  // 반 생성 폼
  const [grade, setGrade] = useState(1);
  const [classNum, setClassNum] = useState(1);
  const [homeroomId, setHomeroomId] = useState<number | ''>('');
  const [classError, setClassError] = useState('');

  // 학생 배정 폼
  const [assignStudentId, setAssignStudentId] = useState<number | ''>('');
  const [assignStudentNum, setAssignStudentNum] = useState('');
  const [stuError, setStuError] = useState('');

  // 교사 배정 폼
  const [assignTeacherId, setAssignTeacherId] = useState<number | ''>('');
  const [assignSubjectId, setAssignSubjectId] = useState<number | ''>('');
  const [subjects, setSubjects] = useState<{ id: number; name: string }[]>([]);
  const [tchError, setTchError] = useState('');

  useEffect(() => {
    load();
  }, [year]);

  useEffect(() => {
    gradeService.getSubjects().then(setSubjects);
  }, []);

  async function load() {
    const [cls, tch, stu] = await Promise.all([
      adminService.getClasses(year),
      adminService.getTeachers(),
      adminService.getStudents(),
    ]);
    setClasses(cls);
    setTeachers(tch.content);
    setStudents(stu.content);
    setSelectedClass(null);
  }

  async function selectClass(c: ClassSummary) {
    setSelectedClass(c);
    const [enr, asgn] = await Promise.all([
      adminService.getClassEnrollments(c.id),
      adminService.getClassAssignments(c.id),
    ]);
    setEnrollments(enr);
    setAssignments(asgn);
  }

  async function handleCreateClass(e: React.FormEvent) {
    e.preventDefault();
    setClassError('');
    try {
      await adminService.createClass({
        academicYear: year, grade, classNum,
        homeroomTeacherId: homeroomId ? Number(homeroomId) : null,
      });
      await load();
    } catch (err: unknown) {
      setClassError((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? '반 생성 실패');
    }
  }

  async function handleAssignStudent(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedClass || !assignStudentId) return;
    setStuError('');
    try {
      await adminService.assignStudentToClass(selectedClass.id, {
        studentId: Number(assignStudentId),
        studentNum: Number(assignStudentNum),
      });
      setAssignStudentId(''); setAssignStudentNum('');
      const enr = await adminService.getClassEnrollments(selectedClass.id);
      setEnrollments(enr);
    } catch (err: unknown) {
      setStuError((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? '배정 실패');
    }
  }

  async function handleAssignTeacher(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedClass || !assignTeacherId || !assignSubjectId) return;
    setTchError('');
    try {
      await adminService.assignTeacherToClass(selectedClass.id, {
        teacherId: Number(assignTeacherId),
        subjectId: Number(assignSubjectId),
      });
      setAssignTeacherId(''); setAssignSubjectId('');
      const asgn = await adminService.getClassAssignments(selectedClass.id);
      setAssignments(asgn);
    } catch (err: unknown) {
      setTchError((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? '배정 실패');
    }
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '20px' }}>
      {/* 왼쪽: 반 목록 + 생성 */}
      <div>
        <div style={styles.form}>
          <h3 style={styles.sectionTitle}>반 편성</h3>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
            <label style={{ fontSize: '13px', lineHeight: '32px' }}>학년도</label>
            <input
              style={{ ...styles.input, width: '80px' }}
              type="number"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
            />
          </div>
          <form onSubmit={handleCreateClass}>
            <div style={styles.row}>
              <select style={styles.input} value={grade} onChange={(e) => setGrade(Number(e.target.value))}>
                <option value={1}>1학년</option><option value={2}>2학년</option><option value={3}>3학년</option>
              </select>
              <input style={{ ...styles.input, width: '60px' }} type="number" min={1} placeholder="반" value={classNum} onChange={(e) => setClassNum(Number(e.target.value))} />
            </div>
            <select style={{ ...styles.input, width: '100%', marginBottom: '8px' }} value={homeroomId} onChange={(e) => setHomeroomId(Number(e.target.value) || '')}>
              <option value="">담임 교사 선택 (선택)</option>
              {teachers.map((t) => <option key={t.id} value={t.id}>{t.name} ({t.department || '-'})</option>)}
            </select>
            {classError && <p style={styles.error}>{classError}</p>}
            <button style={styles.addBtn} type="submit">반 생성</button>
          </form>
        </div>

        <div style={{ marginTop: '16px' }}>
          {classes.map((c) => (
            <div
              key={c.id}
              style={{
                ...styles.classCard,
                ...(selectedClass?.id === c.id ? styles.classCardActive : {}),
              }}
              onClick={() => selectClass(c)}
            >
              <strong>{c.grade}학년 {c.classNum}반</strong>
              <span style={{ fontSize: '12px', color: '#666', marginLeft: '8px' }}>
                {c.homeroomTeacher ? `담임: ${c.homeroomTeacher.name}` : '담임 없음'} · {c.studentCount}명
              </span>
            </div>
          ))}
          {classes.length === 0 && <p style={{ color: '#999', fontSize: '13px' }}>생성된 반이 없습니다.</p>}
        </div>
      </div>

      {/* 오른쪽: 선택된 반 상세 */}
      {selectedClass ? (
        <div>
          <h3 style={styles.sectionTitle}>
            {selectedClass.grade}학년 {selectedClass.classNum}반 상세
          </h3>

          {/* 학생 배정 */}
          <div style={styles.form}>
            <h4 style={{ margin: '0 0 8px', fontSize: '14px' }}>학생 배정</h4>
            <form onSubmit={handleAssignStudent}>
              <div style={styles.row}>
                <select style={styles.input} value={assignStudentId} onChange={(e) => setAssignStudentId(Number(e.target.value) || '')} required>
                  <option value="">학생 선택</option>
                  {students.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                <input style={{ ...styles.input, width: '80px' }} type="number" min={1} placeholder="번호" value={assignStudentNum} onChange={(e) => setAssignStudentNum(e.target.value)} required />
                <button style={styles.addBtn} type="submit">배정</button>
              </div>
              {stuError && <p style={styles.error}>{stuError}</p>}
            </form>
            <table style={styles.table}>
              <thead><tr><th style={styles.th}>번호</th><th style={styles.th}>이름</th></tr></thead>
              <tbody>
                {enrollments.map((e) => (
                  <tr key={e.studentId} style={styles.tr}>
                    <td style={styles.td}>{e.studentNum}</td>
                    <td style={styles.td}>{e.studentName}</td>
                  </tr>
                ))}
                {enrollments.length === 0 && <tr><td colSpan={2} style={styles.empty}>배정된 학생이 없습니다.</td></tr>}
              </tbody>
            </table>
          </div>

          {/* 교사 배정 */}
          <div style={{ ...styles.form, marginTop: '16px' }}>
            <h4 style={{ margin: '0 0 8px', fontSize: '14px' }}>과목 교사 배정</h4>
            <form onSubmit={handleAssignTeacher}>
              <div style={styles.row}>
                <select style={styles.input} value={assignTeacherId} onChange={(e) => setAssignTeacherId(Number(e.target.value) || '')} required>
                  <option value="">교사 선택</option>
                  {teachers.map((t) => <option key={t.id} value={t.id}>{t.name} ({t.department || '-'})</option>)}
                </select>
                <select style={styles.input} value={assignSubjectId} onChange={(e) => setAssignSubjectId(Number(e.target.value) || '')} required>
                  <option value="">과목 선택</option>
                  {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                <button style={styles.addBtn} type="submit">배정</button>
              </div>
              {tchError && <p style={styles.error}>{tchError}</p>}
            </form>
            <table style={styles.table}>
              <thead><tr><th style={styles.th}>과목</th><th style={styles.th}>교사</th></tr></thead>
              <tbody>
                {assignments.map((a) => (
                  <tr key={`${a.teacherId}-${a.subjectId}`} style={styles.tr}>
                    <td style={styles.td}>{a.subjectName}</td>
                    <td style={styles.td}>{a.teacherName}</td>
                  </tr>
                ))}
                {assignments.length === 0 && <tr><td colSpan={2} style={styles.empty}>배정된 교사가 없습니다.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div style={{ color: '#999', fontSize: '14px', paddingTop: '60px', textAlign: 'center' }}>
          왼쪽에서 반을 선택하세요.
        </div>
      )}
    </div>
  );
}

// ── 스타일 ─────────────────────────────────────────

const styles: Record<string, React.CSSProperties> = {
  container: { padding: '24px', maxWidth: '1100px', margin: '0 auto' },
  heading: { margin: '0 0 20px', fontSize: '22px', fontWeight: 600 },
  tabs: { display: 'flex', gap: '4px', marginBottom: '20px', borderBottom: '2px solid #e0e0e0', paddingBottom: '4px' },
  tab: { padding: '8px 20px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', fontSize: '14px', color: '#666', borderRadius: '4px 4px 0 0' },
  tabActive: { backgroundColor: '#1976d2', color: '#fff', fontWeight: 600 },
  panel: { minHeight: '400px' },
  form: { marginBottom: '16px' },
  sectionTitle: { margin: '0 0 12px', fontSize: '16px', fontWeight: 600, color: '#333' },
  row: { display: 'flex', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' as const, alignItems: 'center' },
  input: { padding: '8px 10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '13px', flex: 1, minWidth: '120px' },
  addBtn: { padding: '8px 16px', backgroundColor: '#1976d2', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '13px', cursor: 'pointer', whiteSpace: 'nowrap' as const },
  cancelBtn: { padding: '8px 12px', backgroundColor: '#f5f5f5', color: '#666', border: '1px solid #ddd', borderRadius: '4px', fontSize: '13px', cursor: 'pointer' },
  smallBtn: { padding: '4px 10px', backgroundColor: '#e3f2fd', color: '#1976d2', border: '1px solid #90caf9', borderRadius: '4px', fontSize: '12px', cursor: 'pointer' },
  table: { width: '100%', borderCollapse: 'collapse' as const, fontSize: '13px' },
  th: { padding: '8px 12px', backgroundColor: '#f5f5f5', textAlign: 'left' as const, fontWeight: 600, borderBottom: '1px solid #e0e0e0' },
  tr: { borderBottom: '1px solid #f0f0f0' },
  td: { padding: '8px 12px', color: '#333' },
  empty: { padding: '16px', color: '#999', textAlign: 'center' as const },
  error: { color: '#d32f2f', fontSize: '12px', margin: '4px 0' },
  badgeGreen: { padding: '2px 8px', backgroundColor: '#e8f5e9', color: '#2e7d32', borderRadius: '12px', fontSize: '12px' },
  badgeGray: { padding: '2px 8px', backgroundColor: '#f5f5f5', color: '#757575', borderRadius: '12px', fontSize: '12px' },
  classCard: { padding: '10px 14px', border: '1px solid #e0e0e0', borderRadius: '6px', marginBottom: '6px', cursor: 'pointer' },
  classCardActive: { borderColor: '#1976d2', backgroundColor: '#e3f2fd' },
};
