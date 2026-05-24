import { Bot } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

function AiChatWidget() {
  return (
    <Card className="opacity-60">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          <CardTitle className="text-base">AI 학습 도우미</CardTitle>
          <Badge variant="secondary" className="text-xs">
            준비 중
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="rounded-lg bg-muted/50 p-4 text-center text-sm text-muted-foreground">
            AI 챗봇 기능은 현재 개발 중입니다.
            <br />
            완성되면 학생 데이터를 기반으로 질문에 답변할 수 있습니다.
          </div>
          <Input placeholder="예: 김철수 학생의 수학 성적 추이를 알려줘" disabled />
        </div>
      </CardContent>
    </Card>
  );
}

export default AiChatWidget;
