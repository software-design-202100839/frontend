import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import type { ScoreResponse } from '../../services/gradeService';

interface Props {
  scores: ScoreResponse[];
}

function ScoreRadarChart({ scores }: Props) {
  if (scores.length === 0) return null;

  const chartData = scores.map((s) => ({
    subject: s.subjectName,
    score: s.score,
    fullMark: 100,
  }));

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>전 교과목 레이더 차트</h3>
      <ResponsiveContainer width="100%" height={350}>
        <RadarChart data={chartData}>
          <PolarGrid />
          <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} />
          <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10 }} />
          <Radar
            name="점수"
            dataKey="score"
            stroke="#4a90d9"
            fill="#4a90d9"
            fillOpacity={0.3}
          />
          <Tooltip />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '8px',
    border: '1px solid #e5e5e5',
    marginBottom: '20px',
  },
  title: { margin: '0 0 12px' },
};

export default ScoreRadarChart;
