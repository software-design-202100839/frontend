import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import gradeService from '../../services/gradeService';
import studentService from '../../services/studentService';
import type { StudentInfo } from '../../services/gradeService';
import type { Subject } from '../../services/gradeService';
import { getEnrollment, formatStudentLabel } from '../../types/student';
import StudentSummaryHeader from '@/components/StudentSummaryHeader';
import StudentDrawer from '@/components/StudentDrawer';
import PrivacyBadge from '@/components/PrivacyBadge';
import type {
  StudentRecord,
  RecordType,
  BasicCategory,
  SpecialCategory,
  RecordCategory,
} from '../../services/studentService';
import authService from '../../services/authService';
import RecordForm from './RecordForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

const basicCategories: BasicCategory[] = ['ATTENDANCE', 'GENERAL_OPINION', 'AWARD', 'VOLUNTEER'];
const specialCategories: SpecialCategory[] = ['SPECIAL_NOTE'];

function StudentRecordPage() {
  const [students, setStudents] = useState<StudentInfo[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [year, setYear] = useState(2026);
  const [semester, setSemester] = useState(1);
  const [recordType, setRecordType] = useState<RecordType | ''>('');
  const [categoryFilter, setCategoryFilter] = useState<RecordCategory | ''>('');
  const [records, setRecords] = useState<StudentRecord[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<StudentRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const user = authService.getStoredUser();
  const isTeacher = user?.role === 'TEACHER';
  const isParent = user?.role === 'PARENT';
  const children = user?.children ?? [];

  useEffect(() => {
    if (isTeacher) {
      gradeService.getStudents().then(setStudents);
      gradeService.getSubjects().then(setSubjects);
    } else if (user?.role === 'STUDENT' && user?.roleEntityId) {
      setSelectedStudentId(user.roleEntityId);
    } else if (isParent && children.length > 0) {
      setSelectedStudentId(children[0].id);
    }
  }, []);

  const availableCategories: RecordCategory[] =
    recordType === 'BASIC'
      ? basicCategories
      : recordType === 'SPECIAL'
        ? specialCategories
        : [...basicCategories, ...specialCategories];

  const loadRecords = useCallback(async () => {
    if (!selectedStudentId) {
      return;
    }
    setLoading(true);
    try {
      const data = await studentService.getStudentRecords(
        selectedStudentId,
        year,
        semester,
        categoryFilter || undefined,
        recordType || undefined,
      );
      setRecords(data);
    } catch {
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, [selectedStudentId, year, semester, categoryFilter, recordType]);

  useEffect(() => {
    if (selectedStudentId) {
      loadRecords();
    }
  }, [selectedStudentId, year, semester, categoryFilter, recordType, loadRecords]);

  const handleCreated = () => {
    setShowForm(false);
    setEditTarget(null);
    loadRecords();
  };

  const handleEdit = (record: StudentRecord) => {
    setEditTarget(record);
    setShowForm(true);
  };

  const handleDelete = async (recordId: number) => {
    if (!confirm('학생부 항목을 삭제하시겠습니까?')) {
      return;
    }
    await studentService.deleteRecord(recordId);
    loadRecords();
  };

  const handleRecordTypeChange = (newType: RecordType | '') => {
    setRecordType(newType);
    setCategoryFilter('');
  };

  const selectedStudent = students.find((s) => s.id === selectedStudentId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">학생부 관리</h2>
        {isTeacher && (
          <Button
            onClick={() => {
              if (showForm) {
                setShowForm(false);
                setEditTarget(null);
              } else {
                setShowForm(true);
              }
            }}
            variant={showForm ? 'outline' : 'default'}
            disabled={!showForm && !selectedStudentId && !editTarget}
          >
            {showForm ? (
              '취소'
            ) : (
              <>
                <Plus className="h-4 w-4" /> 항목 등록
              </>
            )}
          </Button>
        )}
      </div>

      {showForm && selectedStudentId && (
        <RecordForm
          studentId={selectedStudentId}
          subjects={subjects}
          editTarget={editTarget}
          onSuccess={handleCreated}
        />
      )}

      <div className="flex flex-wrap gap-3">
        <Select value={year} onChange={(e) => setYear(Number(e.target.value))} className="w-28">
          {[2024, 2025, 2026].map((y) => (
            <option key={y} value={y}>
              {y}년
            </option>
          ))}
        </Select>
        <Select
          value={semester}
          onChange={(e) => setSemester(Number(e.target.value))}
          className="w-24"
        >
          <option value={1}>1학기</option>
          <option value={2}>2학기</option>
        </Select>
        <Select
          value={recordType}
          onChange={(e) => handleRecordTypeChange(e.target.value as RecordType | '')}
          className="w-auto"
        >
          <option value="">전체 구분</option>
          <option value="BASIC">담임</option>
          <option value="SPECIAL">교과</option>
        </Select>

        <Select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value as RecordCategory | '')}
          className="w-auto"
        >
          <option value="">전체 카테고리</option>
          {availableCategories.map((c) => (
            <option key={c} value={c}>
              {studentService.categoryLabels[c]}
            </option>
          ))}
        </Select>
      </div>

      {isTeacher &&
        (() => {
          const s = students.find((st) => st.id === selectedStudentId) ?? null;
          const e = s ? getEnrollment(s, year) : undefined;
          const student = s
            ? {
                id: s.id,
                name: s.name,
                grade: e?.grade,
                classNum: e?.classNum,
                studentNum: e?.studentNum,
              }
            : null;
          return (
            <>
              <StudentSummaryHeader student={student} onChangeStudent={() => setDrawerOpen(true)} />
              <StudentDrawer
                open={drawerOpen}
                onOpenChange={setDrawerOpen}
                students={students}
                onSelect={(id) => setSelectedStudentId(id)}
                selectedStudentId={selectedStudentId}
                year={year}
              />
            </>
          );
        })()}
      {isParent && children.length > 1 && (
        <Select
          value={selectedStudentId ?? ''}
          onChange={(e) => setSelectedStudentId(Number(e.target.value) || null)}
          className="w-40"
        >
          {children.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
      )}

      {selectedStudent && (
        <div className="rounded-md bg-muted px-4 py-3 text-sm">
          <strong>{formatStudentLabel(selectedStudent, year)}</strong>
        </div>
      )}

      {loading && <p className="text-center text-muted-foreground">로딩 중...</p>}

      {!loading && records.length === 0 && selectedStudentId && (
        <p className="py-10 text-center text-muted-foreground">등록된 학생부 항목이 없습니다.</p>
      )}

      <div className="space-y-3">
        {records.map((record) => (
          <Card key={record.id}>
            <CardContent className="p-4">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <Badge variant={record.recordType === 'BASIC' ? 'success' : 'warning'}>
                  {studentService.recordTypeLabels[record.recordType]}
                </Badge>
                <Badge variant="secondary">{studentService.categoryLabels[record.category]}</Badge>
                {record.subjectName && (
                  <span className="text-xs text-muted-foreground">{record.subjectName}</span>
                )}
                <span className="text-xs text-muted-foreground">
                  {new Date(record.updatedAt).toLocaleDateString('ko-KR')}
                </span>
                {isTeacher && (
                  <div className="flex gap-1">
                    <PrivacyBadge target="학생" isPublic={record.isVisibleToStudent} />
                    <PrivacyBadge target="학부모" isPublic={record.isVisibleToParent} />
                  </div>
                )}
                {isTeacher && (
                  <div className="ml-auto flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(record)}>
                      <Edit className="h-3.5 w-3.5" />
                      수정
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(record.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                      삭제
                    </Button>
                  </div>
                )}
              </div>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                {typeof record.content.text === 'string'
                  ? record.content.text
                  : JSON.stringify(record.content, null, 2)}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default StudentRecordPage;
