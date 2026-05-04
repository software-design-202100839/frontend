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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
  scores: ScoreResponse[];
}

function ScoreRadarChart({ scores }: Props) {
  if (scores.length === 0) {
    return null;
  }

  const chartData = scores.map((s) => ({ subject: s.subjectName, score: s.score, fullMark: 100 }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">전 교과목 레이더 차트</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <RadarChart data={chartData}>
            <PolarGrid stroke="#e2e8f0" />
            <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} />
            <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10 }} />
            <Radar name="점수" dataKey="score" stroke="#2563eb" fill="#2563eb" fillOpacity={0.2} />
            <Tooltip />
          </RadarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export default ScoreRadarChart;
