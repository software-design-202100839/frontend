import { useState, useEffect, useCallback } from 'react';
import gradeService from '../../services/gradeService';
import type { StudentInfo, StudentScoreSummary, Subject } from '../../services/gradeService';
import { formatStudentLabel } from '../../types/student';
import authService from '../../services/authService';
import ScoreForm from './ScoreForm';
import ScoreRadarChart from './ScoreRadarChart';

function GradePage() {
  const [students, setStudents] = useState<StudentInfo[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [year, setYear] = useState(2026);
  const [semester, setSemester] = useState(1);
  const [summary, setSummary] = useState<StudentScoreSummary | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const user = authService.getStoredUser();
  const isTeacher = user?.role === 'TEACHER';

  useEffect(() => {
    gradeService.getSubjects().then(setSubjects);
    if (isTeacher) {
      gradeService.getStudents().then(setStudents);
    } else if (user?.roleEntityId) {
      setSelectedStudentId(user.roleEntityId);
    }
  }, []);

  const loadScores = useCallback(async () => {
    if (!selectedStudentId) {
      return;
    }
    setLoading(true);
    try {
      const data = await gradeService.getStudentScores(selectedStudentId, year, semester);
      setSummary(data);
    } catch {
      setSummary(null);
    } finally {
      setLoading(false);
    }
  }, [selectedStudentId, year, semester]);

  useEffect(() => {
    if (selectedStudentId) {
      loadScores();
    }
  }, [selectedStudentId, year, semester, loadScores]);

  const handleScoreCreated = () => {
    setShowForm(false);
    loadScores();
  };

  const handleDelete = async (scoreId: number) => {
    if (!confirm('성적을 삭제하시겠습니까?')) {
      return;
    }
    await gradeService.deleteScore(scoreId);
    loadScores();
  };

  return (
    <div>
      <div style={styles.toolbar}>
        <h2 style={styles.title}>성적 관리</h2>
        {isTeacher && (
          <button onClick={() => setShowForm(!showForm)} style={styles.addButton}>
            {showForm ? '취소' : '+ 성적 등록'}
          </button>
        )}
      </div>

      {showForm && (
        <ScoreForm students={students} subjects={subjects} onSuccess={handleScoreCreated} />
      )}

      <div style={styles.filterRow}>
        {isTeacher && (
          <select
            value={selectedStudentId ?? ''}
            onChange={(e) => setSelectedStudentId(Number(e.target.value) || null)}
            style={styles.select}
          >
            <option value="">학생 선택</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {formatStudentLabel(s, year)}
              </option>
            ))}
          </select>
        )}

        <select
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          style={styles.select}
        >
          {[2024, 2025, 2026].map((y) => (
            <option key={y} value={y}>
              {y}년
            </option>
          ))}
        </select>

        <select
          value={semester}
          onChange={(e) => setSemester(Number(e.target.value))}
          style={styles.select}
        >
          <option value={1}>1학기</option>
          <option value={2}>2학기</option>
        </select>
      </div>

      {loading && <p style={styles.loading}>로딩 중...</p>}

      {summary && summary.scores.length > 0 && (
        <>
          <div style={styles.summaryCard}>
            <h3>
              {summary.studentName}의 {summary.year}년 {summary.semester}학기 성적
            </h3>
            <div style={styles.summaryStats}>
              <div style={styles.stat}>
                <span style={styles.statLabel}>총점</span>
                <span style={styles.statValue}>{summary.totalScore}</span>
              </div>
              <div style={styles.stat}>
                <span style={styles.statLabel}>평균</span>
                <span style={styles.statValue}>{summary.averageScore}</span>
              </div>
              <div style={styles.stat}>
                <span style={styles.statLabel}>평균 등급</span>
                <span style={styles.statValue}>{summary.averageGradeLetter}</span>
              </div>
            </div>
          </div>

          <ScoreRadarChart scores={summary.scores} />

          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>과목</th>
                <th style={styles.th}>점수</th>
                <th style={styles.th}>등급</th>
                <th style={styles.th}>석차</th>
                {isTeacher && <th style={styles.th}>관리</th>}
              </tr>
            </thead>
            <tbody>
              {summary.scores.map((s) => (
                <tr key={s.id}>
                  <td style={styles.td}>{s.subjectName}</td>
                  <td style={styles.td}>{s.score}</td>
                  <td style={styles.td}>{s.gradeLetter}</td>
                  <td style={styles.td}>{s.rank ?? '-'}</td>
                  {isTeacher && (
                    <td style={styles.td}>
                      <button onClick={() => handleDelete(s.id)} style={styles.deleteButton}>
                        삭제
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {summary && summary.scores.length === 0 && (
        <p style={styles.empty}>등록된 성적이 없습니다.</p>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  toolbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  title: { margin: 0 },
  addButton: {
    padding: '8px 16px',
    backgroundColor: '#4a90d9',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  filterRow: {
    display: 'flex',
    gap: '12px',
    marginBottom: '20px',
  },
  select: {
    padding: '8px 12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
  },
  loading: { color: '#999', textAlign: 'center' },
  summaryCard: {
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '8px',
    border: '1px solid #e5e5e5',
    marginBottom: '20px',
  },
  summaryStats: {
    display: 'flex',
    gap: '32px',
    marginTop: '12px',
  },
  stat: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  statLabel: { fontSize: '12px', color: '#999' },
  statValue: { fontSize: '24px', fontWeight: 'bold', color: '#333' },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    backgroundColor: '#fff',
    borderRadius: '8px',
    overflow: 'hidden',
  },
  th: {
    padding: '12px',
    backgroundColor: '#f8f9fa',
    borderBottom: '2px solid #e5e5e5',
    textAlign: 'left',
    fontSize: '13px',
    color: '#666',
  },
  td: {
    padding: '12px',
    borderBottom: '1px solid #f0f0f0',
    fontSize: '14px',
  },
  deleteButton: {
    padding: '4px 8px',
    backgroundColor: '#ff4d4f',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
  },
  empty: {
    textAlign: 'center',
    color: '#999',
    padding: '40px',
  },
};

export default GradePage;
