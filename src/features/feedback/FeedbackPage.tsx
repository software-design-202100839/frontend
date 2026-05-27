import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import gradeService from '../../services/gradeService';
import feedbackService from '../../services/feedbackService';
import type { StudentInfo } from '../../services/gradeService';
import { formatStudentLabel } from '../../types/student';
import StudentSelector from '@/components/StudentSelector';

const CURRENT_YEAR = new Date().getFullYear();
import type { FeedbackResponse, FeedbackCategory } from '../../services/feedbackService';
import authService from '../../services/authService';
import FeedbackForm from './FeedbackForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

const categories: FeedbackCategory[] = [
  'ACADEMIC',
  'BEHAVIOR',
  'ATTENDANCE',
  'ATTITUDE',
  'GENERAL',
];

function FeedbackPage() {
  const [students, setStudents] = useState<StudentInfo[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<FeedbackCategory | ''>('');
  const [feedbacks, setFeedbacks] = useState<FeedbackResponse[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<FeedbackResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const user = authService.getStoredUser();
  const isTeacher = user?.role === 'TEACHER';

  const isParent = user?.role === 'PARENT';
  const children = user?.children ?? [];

  useEffect(() => {
    if (isTeacher) {
      gradeService.getStudents().then(setStudents);
    } else if (user?.role === 'STUDENT' && user?.roleEntityId) {
      setSelectedStudentId(user.roleEntityId);
    } else if (isParent && children.length > 0) {
      setSelectedStudentId(children[0].id);
    }
  }, []);

  const loadFeedbacks = useCallback(async () => {
    if (!selectedStudentId) {
      return;
    }
    setLoading(true);
    try {
      let data: FeedbackResponse[];
      if (user?.role === 'STUDENT') {
        data = await feedbackService.getVisibleFeedbacksForStudent(selectedStudentId);
      } else if (user?.role === 'PARENT') {
        data = await feedbackService.getVisibleFeedbacksForParent(selectedStudentId);
      } else {
        data = await feedbackService.getFeedbacksByStudent(
          selectedStudentId,
          categoryFilter || undefined,
        );
      }
      setFeedbacks(data);
    } catch {
      setFeedbacks([]);
    } finally {
      setLoading(false);
    }
  }, [selectedStudentId, categoryFilter, user?.role]);

  useEffect(() => {
    if (selectedStudentId) {
      loadFeedbacks();
    }
  }, [selectedStudentId, categoryFilter, loadFeedbacks]);

  const handleCreated = () => {
    setShowForm(false);
    setEditTarget(null);
    loadFeedbacks();
  };

  const handleEdit = (feedback: FeedbackResponse) => {
    setEditTarget(feedback);
    setShowForm(true);
  };

  const handleDelete = async (feedbackId: number) => {
    if (!confirm('피드백을 삭제하시겠습니까?')) {
      return;
    }
    await feedbackService.deleteFeedback(feedbackId);
    loadFeedbacks();
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditTarget(null);
  };

  const selectedStudent = students.find((s) => s.id === selectedStudentId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">피드백 관리</h2>
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
                <Plus className="h-4 w-4" /> 피드백 작성
              </>
            )}
          </Button>
        )}
      </div>

      {showForm && (selectedStudentId || editTarget) && (
        <FeedbackForm
          studentId={editTarget?.studentId ?? selectedStudentId!}
          students={students}
          editTarget={editTarget}
          onSuccess={handleCreated}
        />
      )}

      <div className="flex flex-wrap gap-3">
        <Select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value as FeedbackCategory | '')}
          className="w-auto"
        >
          <option value="">전체 카테고리</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {feedbackService.categoryLabels[c]}
            </option>
          ))}
        </Select>
      </div>

      {isTeacher && (
        <StudentSelector
          students={students}
          selectedStudentId={selectedStudentId}
          year={CURRENT_YEAR}
          onSelect={setSelectedStudentId}
        />
      )}
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
          <strong>{formatStudentLabel(selectedStudent, CURRENT_YEAR)}</strong>
        </div>
      )}

      {loading && <p className="text-center text-muted-foreground">로딩 중...</p>}

      {!loading && feedbacks.length === 0 && selectedStudentId && (
        <p className="py-10 text-center text-muted-foreground">등록된 피드백이 없습니다.</p>
      )}

      <div className="space-y-3">
        {feedbacks.map((fb) => (
          <Card key={fb.id}>
            <CardContent className="p-4">
              <div className="mb-2 flex items-center gap-3">
                <Badge variant="secondary">{feedbackService.categoryLabels[fb.category]}</Badge>
                <span className="text-[13px] text-muted-foreground">{fb.teacherName}</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(fb.updatedAt).toLocaleDateString('ko-KR')}
                </span>
                {isTeacher && (
                  <div className="ml-auto flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(fb)}>
                      <Edit className="h-3.5 w-3.5" />
                      수정
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(fb.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                      삭제
                    </Button>
                  </div>
                )}
              </div>
              <p className="mb-2 text-sm leading-relaxed text-foreground">{fb.content}</p>
              <div className="flex gap-2">
                <Badge
                  variant={fb.isVisibleToStudent ? 'success' : 'outline'}
                  className="text-[11px]"
                >
                  {fb.isVisibleToStudent ? (
                    <Eye className="mr-1 h-3 w-3" />
                  ) : (
                    <EyeOff className="mr-1 h-3 w-3" />
                  )}
                  학생 {fb.isVisibleToStudent ? '공개' : '비공개'}
                </Badge>
                <Badge
                  variant={fb.isVisibleToParent ? 'success' : 'outline'}
                  className="text-[11px]"
                >
                  {fb.isVisibleToParent ? (
                    <Eye className="mr-1 h-3 w-3" />
                  ) : (
                    <EyeOff className="mr-1 h-3 w-3" />
                  )}
                  학부모 {fb.isVisibleToParent ? '공개' : '비공개'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default FeedbackPage;
