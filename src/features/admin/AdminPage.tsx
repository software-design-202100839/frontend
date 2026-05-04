import { useState, useEffect, useCallback } from 'react';
import { Trash2, Users, UserPlus, School, BookOpen, GraduationCap } from 'lucide-react';
import adminService, {
  type TeacherSummary,
  type StudentSummary,
  type ParentSummary,
  type ClassSummary,
  type AssignmentSummary,
} from '../../services/adminService';
import gradeService, { type Subject } from '../../services/gradeService';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

type Tab = 'teachers' | 'students' | 'parents' | 'classes' | 'assignments';

const TAB_LABEL: Record<Tab, string> = {
  teachers: '교사',
  students: '학생',
  parents: '학부모',
  classes: '반 관리',
  assignments: '과목 배정',
};

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>('teachers');

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">관리자</h2>
      <div className="flex gap-1 border-b-2 border-border">
        {(Object.keys(TAB_LABEL) as Tab[]).map((t) => (
          <button
            key={t}
            className={cn(
              'cursor-pointer border-b-2 border-transparent px-5 py-2 text-sm text-muted-foreground -mb-[2px] bg-transparent',
              tab === t && 'border-primary font-semibold text-primary',
            )}
            onClick={() => setTab(t)}
          >
            {TAB_LABEL[t]}
          </button>
        ))}
      </div>
      <div>
        {tab === 'teachers' && <TeachersTab />}
        {tab === 'students' && <StudentsTab />}
        {tab === 'parents' && <ParentsTab />}
        {tab === 'classes' && <ClassesTab />}
        {tab === 'assignments' && <AssignmentsTab />}
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
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><UserPlus className="h-4 w-4" /> 교사 등록</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField label="이름" value={name} onChange={setName} required />
            <FormField label="전화번호" value={phone} onChange={setPhone} placeholder="010-1234-5678" required />
            <FormField label="담당교과" value={dept} onChange={setDept} placeholder="수학 (선택)" />
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" disabled={loading}>{loading ? '처리 중...' : '등록'}</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Users className="h-4 w-4" /> 교사 목록 ({teachers.length}명)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>이름</TableHead>
                <TableHead>전화번호</TableHead>
                <TableHead>담당교과</TableHead>
                <TableHead>활성화</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teachers.map((t) => (
                <TableRow key={t.id}>
                  <TableCell>{t.name}</TableCell>
                  <TableCell>{t.phone}</TableCell>
                  <TableCell>{t.department ?? '-'}</TableCell>
                  <TableCell><StatusBadge active={t.activated} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
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
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><UserPlus className="h-4 w-4" /> 학생 등록</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegister} className="space-y-4">
              <FormField label="이름" value={name} onChange={setName} required />
              <FormField label="전화번호" value={phone} onChange={setPhone} placeholder="010-1234-5678" required />
              <FormField label="입학년도" value={admYear} onChange={setAdmYear} placeholder="2026" required />
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" disabled={loading}>{loading ? '처리 중...' : '등록'}</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><School className="h-4 w-4" /> 반 배정</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleEnroll} className="space-y-4">
              <div>
                <Label className="mb-1.5 block">학생 선택</Label>
                <Select value={enrollStudentId} onChange={e => setEnrollStudentId(e.target.value)} required>
                  <option value="">-- 학생 선택 --</option>
                  {students.filter(st => !st.currentEnrollment).map(st => (
                    <option key={st.id} value={st.id}>{st.name} ({st.admissionYear}년 입학)</option>
                  ))}
                </Select>
              </div>
              <div>
                <Label className="mb-1.5 block">반 선택</Label>
                <Select value={enrollClassId} onChange={e => setEnrollClassId(e.target.value)} required>
                  <option value="">-- 반 선택 --</option>
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.grade}학년 {c.classNum}반</option>
                  ))}
                </Select>
              </div>
              <FormField label="학번" value={enrollStudentNum} onChange={setEnrollStudentNum} placeholder="1" required />
              {enrollError && <p className="text-sm text-destructive">{enrollError}</p>}
              <Button type="submit" disabled={enrollLoading}>{enrollLoading ? '처리 중...' : '배정'}</Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>학생 목록 ({students.length}명)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>이름</TableHead>
                <TableHead>전화번호</TableHead>
                <TableHead>입학년도</TableHead>
                <TableHead>소속 반</TableHead>
                <TableHead>활성화</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((st) => (
                <TableRow key={st.id}>
                  <TableCell>{st.id}</TableCell>
                  <TableCell>{st.name}</TableCell>
                  <TableCell>{st.phone}</TableCell>
                  <TableCell>{st.admissionYear}</TableCell>
                  <TableCell>
                    {st.currentEnrollment
                      ? `${st.currentEnrollment.grade}학년 ${st.currentEnrollment.classNum}반 ${st.currentEnrollment.studentNum}번`
                      : '미배정'}
                  </TableCell>
                  <TableCell><StatusBadge active={st.activated} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
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
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><UserPlus className="h-4 w-4" /> 학부모 등록</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegister} className="space-y-4">
              <FormField label="이름" value={name} onChange={setName} required />
              <FormField label="전화번호" value={phone} onChange={setPhone} placeholder="010-1234-5678" required />
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" disabled={loading}>{loading ? '처리 중...' : '등록'}</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Users className="h-4 w-4" /> 자녀 연결</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLink} className="space-y-4">
              <div>
                <Label className="mb-1.5 block">학부모 선택</Label>
                <Select value={linkParentId} onChange={e => setLinkParentId(e.target.value)} required>
                  <option value="">-- 학부모 선택 --</option>
                  {parents.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </Select>
              </div>
              <div>
                <Label className="mb-1.5 block">학생 선택</Label>
                <Select value={linkStudentId} onChange={e => setLinkStudentId(e.target.value)} required>
                  <option value="">-- 학생 선택 --</option>
                  {students.map(st => <option key={st.id} value={st.id}>{st.name}</option>)}
                </Select>
              </div>
              <div>
                <Label className="mb-1.5 block">관계</Label>
                <Select value={relationship} onChange={e => setRelationship(e.target.value as typeof relationship)}>
                  <option value="FATHER">부</option>
                  <option value="MOTHER">모</option>
                  <option value="GUARDIAN">보호자</option>
                </Select>
              </div>
              {linkError && <p className="text-sm text-destructive">{linkError}</p>}
              <Button type="submit" disabled={linkLoading}>{linkLoading ? '처리 중...' : '연결'}</Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>학부모 목록 ({parents.length}명)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>이름</TableHead>
                <TableHead>전화번호</TableHead>
                <TableHead>자녀</TableHead>
                <TableHead>활성화</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {parents.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>{p.name}</TableCell>
                  <TableCell>{p.phone}</TableCell>
                  <TableCell>{p.children.map(c => `${c.studentName}(${c.relationship})`).join(', ') || '-'}</TableCell>
                  <TableCell><StatusBadge active={p.activated} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
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
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><School className="h-4 w-4" /> 반 생성 ({year}학년도)</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateClass} className="space-y-4">
              <div>
                <Label className="mb-1.5 block">학년</Label>
                <Select value={grade} onChange={e => setGrade(e.target.value)}>
                  <option value="1">1학년</option>
                  <option value="2">2학년</option>
                  <option value="3">3학년</option>
                </Select>
              </div>
              <FormField label="반 번호" value={classNum} onChange={setClassNum} placeholder="1" required />
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" disabled={loading}>{loading ? '처리 중...' : '생성'}</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><GraduationCap className="h-4 w-4" /> 담임 배정</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAssignHomeroom} className="space-y-4">
              <div>
                <Label className="mb-1.5 block">반 선택</Label>
                <Select value={homeroomClassId} onChange={e => setHomeroomClassId(e.target.value)} required>
                  <option value="">-- 반 선택 --</option>
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.grade}학년 {c.classNum}반</option>
                  ))}
                </Select>
              </div>
              <div>
                <Label className="mb-1.5 block">교사 선택</Label>
                <Select value={homeroomTeacherId} onChange={e => setHomeroomTeacherId(e.target.value)} required>
                  <option value="">-- 교사 선택 --</option>
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>{t.name}{t.department ? ` (${t.department})` : ''}</option>
                  ))}
                </Select>
              </div>
              {homeroomError && <p className="text-sm text-destructive">{homeroomError}</p>}
              <Button type="submit">배정</Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>반 목록</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>학년</TableHead>
                <TableHead>반</TableHead>
                <TableHead>담임</TableHead>
                <TableHead>학생 수</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {classes.sort((a, b) => a.grade - b.grade || a.classNum - b.classNum).map(c => (
                <TableRow key={c.id}>
                  <TableCell>{c.grade}학년</TableCell>
                  <TableCell>{c.classNum}반</TableCell>
                  <TableCell>{c.homeroomTeacher?.name ?? '미배정'}</TableCell>
                  <TableCell>{c.studentCount}명</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── 과목 배정 탭 ─────────────────────────────────────────

function AssignmentsTab() {
  const year = new Date().getFullYear();
  const [assignments, setAssignments] = useState<AssignmentSummary[]>([]);
  const [teachers, setTeachers]       = useState<TeacherSummary[]>([]);
  const [classes, setClasses]         = useState<ClassSummary[]>([]);
  const [subjects, setSubjects]       = useState<Subject[]>([]);

  const [teacherId, setTeacherId] = useState('');
  const [classId, setClassId]     = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [error, setError]         = useState('');
  const [loading, setLoading]     = useState(false);

  const load = useCallback(() => Promise.all([
    adminService.getAssignments(year).then(setAssignments),
    adminService.getTeachers().then(setTeachers),
    adminService.getClasses(year).then(setClasses),
    gradeService.getSubjects().then(setSubjects),
  ]), [year]);

  useEffect(() => { load(); }, [load]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await adminService.createAssignment({
        teacherId: Number(teacherId),
        classId: Number(classId),
        subjectId: Number(subjectId),
        academicYear: year,
      });
      setTeacherId(''); setClassId(''); setSubjectId('');
      load();
    } catch (err: unknown) {
      setError((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? '배정 실패');
    } finally { setLoading(false); }
  }

  async function handleDelete(assignmentId: number) {
    if (!confirm('이 과목 배정을 삭제하시겠습니까?')) return;
    try {
      await adminService.deleteAssignment(assignmentId);
      load();
    } catch {
      alert('삭제 실패');
    }
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><BookOpen className="h-4 w-4" /> 교사 과목 배정 ({year}학년도)</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <Label className="mb-1.5 block">교사 선택</Label>
              <Select value={teacherId} onChange={e => setTeacherId(e.target.value)} required>
                <option value="">-- 교사 선택 --</option>
                {teachers.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.name}{t.department ? ` (${t.department})` : ''}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <Label className="mb-1.5 block">반 선택</Label>
              <Select value={classId} onChange={e => setClassId(e.target.value)} required>
                <option value="">-- 반 선택 --</option>
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.grade}학년 {c.classNum}반</option>
                ))}
              </Select>
            </div>

            <div>
              <Label className="mb-1.5 block">과목 선택</Label>
              <Select value={subjectId} onChange={e => setSubjectId(e.target.value)} required>
                <option value="">-- 과목 선택 --</option>
                {subjects.map(sub => (
                  <option key={sub.id} value={sub.id}>{sub.name} ({sub.code})</option>
                ))}
              </Select>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" disabled={loading}>{loading ? '처리 중...' : '배정'}</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>배정 현황</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>교사</TableHead>
                <TableHead>반</TableHead>
                <TableHead>과목</TableHead>
                <TableHead>삭제</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assignments.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">배정 내역 없음</TableCell>
                </TableRow>
              )}
              {assignments
                .sort((a, b) => a.classInfo.grade - b.classInfo.grade || a.classInfo.classNum - b.classInfo.classNum)
                .map(a => (
                  <TableRow key={a.id}>
                    <TableCell>{a.teacher.name}{a.teacher.department ? ` (${a.teacher.department})` : ''}</TableCell>
                    <TableCell>{a.classInfo.grade}학년 {a.classInfo.classNum}반</TableCell>
                    <TableCell>{a.subject.name}</TableCell>
                    <TableCell>
                      <Button
                        onClick={() => handleDelete(a.id)}
                        variant="destructive"
                        size="sm"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> 삭제
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── 공통 컴포넌트 ────────────────────────────────────────

function FormField({ label, value, onChange, placeholder, required }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; required?: boolean;
}) {
  return (
    <div>
      <Label className="mb-1.5 block">{label}</Label>
      <Input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
      />
    </div>
  );
}

function StatusBadge({ active }: { active: boolean }) {
  return (
    <Badge variant={active ? 'success' : 'destructive'}>
      {active ? '활성' : '미활성'}
    </Badge>
  );
}
