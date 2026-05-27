import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, Search, RotateCcw } from 'lucide-react';
import gradeService from '../../services/gradeService';
import counselService from '../../services/counselService';
import type { StudentInfo } from '../../services/gradeService';
import { getEnrollment, formatStudentLabel } from '../../types/student';
import StudentSummaryHeader from '@/components/StudentSummaryHeader';
import StudentDrawer from '@/components/StudentDrawer';

const CURRENT_YEAR = new Date().getFullYear();
import type { CounselingResponse, CounselCategory } from '../../services/counselService';
import authService from '../../services/authService';
import CounselingForm from './CounselingForm';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

const categories: CounselCategory[] = ['ACADEMIC', 'CAREER', 'BEHAVIOR', 'PERSONAL', 'OTHER'];

function CounselingPage() {
  const [students, setStudents] = useState<StudentInfo[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<CounselCategory | ''>('');
  const [counselings, setCounselings] = useState<CounselingResponse[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<CounselingResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchStartDate, setSearchStartDate] = useState('');
  const [searchEndDate, setSearchEndDate] = useState('');
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const user = authService.getStoredUser();
  const isTeacher = user?.role === 'TEACHER';
  const isAdmin = user?.role === 'ADMIN';
  const canSearch = isTeacher || isAdmin;

  useEffect(() => {
    if (isTeacher) {
      gradeService.getStudents().then(setStudents);
    } else if (user?.roleEntityId) {
      setSelectedStudentId(user.roleEntityId);
    }
  }, []);

  const loadCounselings = useCallback(async () => {
    if (!selectedStudentId) {
      return;
    }
    setLoading(true);
    try {
      const data = await counselService.getCounselingsByStudent(
        selectedStudentId,
        categoryFilter || undefined,
      );
      setCounselings(data);
    } catch {
      setCounselings([]);
    } finally {
      setLoading(false);
    }
  }, [selectedStudentId, categoryFilter]);

  useEffect(() => {
    if (selectedStudentId) {
      loadCounselings();
    }
  }, [selectedStudentId, categoryFilter, loadCounselings]);

  const handleCreated = () => {
    setShowForm(false);
    setEditTarget(null);
    loadCounselings();
  };

  const handleEdit = (counseling: CounselingResponse) => {
    setEditTarget(counseling);
    setShowForm(true);
  };

  const handleDelete = async (counselingId: number) => {
    if (!confirm('상담내역을 삭제하시겠습니까?')) {
      return;
    }
    await counselService.deleteCounseling(counselingId);
    loadCounselings();
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditTarget(null);
  };

  const handleSearch = async () => {
    if (!selectedStudentId || !searchStartDate || !searchEndDate) {
      return;
    }
    setLoading(true);
    try {
      const data = await counselService.searchCounselings(
        selectedStudentId,
        searchStartDate,
        searchEndDate,
      );
      setCounselings(data);
      setIsSearchMode(true);
    } catch {
      setCounselings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleResetSearch = () => {
    setSearchStartDate('');
    setSearchEndDate('');
    setIsSearchMode(false);
    loadCounselings();
  };

  const selectedStudent = students.find((s) => s.id === selectedStudentId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">상담내역 관리</h2>
        {isTeacher && (
          <Button
            onClick={() => (showForm ? handleCancel() : setShowForm(true))}
            variant={showForm ? 'outline' : 'default'}
            disabled={!showForm && !editTarget && !selectedStudentId}
          >
            {showForm ? (
              '취소'
            ) : (
              <>
                <Plus className="h-4 w-4" /> 상담 기록
              </>
            )}
          </Button>
        )}
      </div>

      {showForm && (selectedStudentId || editTarget) && (
        <CounselingForm
          studentId={editTarget?.studentId ?? selectedStudentId!}
          students={students}
          editTarget={editTarget}
          onSuccess={handleCreated}
        />
      )}

      <div className="flex flex-wrap gap-3">
        <Select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value as CounselCategory | '')}
          className="w-auto"
        >
          <option value="">전체 카테고리</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {counselService.categoryLabels[c]}
            </option>
          ))}
        </Select>
      </div>

      {isTeacher &&
        (() => {
          const s = students.find((st) => st.id === selectedStudentId) ?? null;
          const e = s ? getEnrollment(s, CURRENT_YEAR) : undefined;
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
                year={CURRENT_YEAR}
              />
            </>
          );
        })()}

      {canSearch && selectedStudentId && (
        <div className="flex flex-wrap items-center gap-2">
          <Input
            type="date"
            value={searchStartDate}
            onChange={(e) => setSearchStartDate(e.target.value)}
            className="w-auto"
          />
          <span className="text-sm text-muted-foreground">~</span>
          <Input
            type="date"
            value={searchEndDate}
            onChange={(e) => setSearchEndDate(e.target.value)}
            className="w-auto"
          />
          <Button onClick={handleSearch} disabled={!searchStartDate || !searchEndDate} size="sm">
            <Search className="h-4 w-4" /> 기간 검색
          </Button>
          {isSearchMode && (
            <Button onClick={handleResetSearch} variant="outline" size="sm">
              <RotateCcw className="h-4 w-4" /> 전체 보기
            </Button>
          )}
        </div>
      )}

      {selectedStudent && (
        <div className="rounded-md bg-muted px-4 py-3 text-sm">
          <strong>{formatStudentLabel(selectedStudent, CURRENT_YEAR)}</strong>
        </div>
      )}

      {loading && <p className="text-center text-muted-foreground">로딩 중...</p>}

      {!loading && counselings.length === 0 && selectedStudentId && (
        <p className="py-10 text-center text-muted-foreground">등록된 상담내역이 없습니다.</p>
      )}

      <div className="space-y-3">
        {counselings.map((c) => (
          <Card key={c.id}>
            <CardContent className="p-4">
              <div className="mb-2 flex flex-wrap items-center gap-3">
                <Badge variant="secondary">{counselService.categoryLabels[c.category]}</Badge>
                <span className="text-sm font-semibold text-foreground">{c.counselDate}</span>
                <span className="text-sm text-muted-foreground">{c.teacherName}</span>
                <Badge variant="secondary">교사 공유</Badge>
                {isTeacher && c.teacherId === user?.roleEntityId && (
                  <div className="ml-auto flex gap-2">
                    <Button onClick={() => handleEdit(c)} variant="outline" size="sm">
                      <Edit className="h-3.5 w-3.5" /> 수정
                    </Button>
                    <Button onClick={() => handleDelete(c.id)} variant="destructive" size="sm">
                      <Trash2 className="h-3.5 w-3.5" /> 삭제
                    </Button>
                  </div>
                )}
              </div>
              <p className="mb-2 text-sm leading-relaxed text-foreground">{c.content}</p>
              {c.nextPlan && (
                <div className="mb-1 rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">
                  <strong>후속 계획:</strong> {c.nextPlan}
                </div>
              )}
              {c.nextCounselDate && (
                <p className="text-xs font-semibold text-primary">
                  다음 상담 예정: {c.nextCounselDate}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default CounselingPage;
