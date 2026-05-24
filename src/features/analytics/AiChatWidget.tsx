import { useState, useRef, useEffect, type KeyboardEvent } from 'react';
import { Bot, Send, User, Loader2 } from 'lucide-react';
import analyticsService from '../../services/analyticsService';
import authService from '../../services/authService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ChatMessage {
  role: 'user' | 'ai';
  content: string;
}

const EXAMPLE_QUESTIONS = [
  '테스트학생의 성적 추이를 알려줘',
  '2026년 1학기 전체 과목 통계를 보여줘',
  '위험도가 높은 학생이 있어?',
];

function AiChatWidget() {
  const user = authService.getStoredUser();
  const canUse = user?.role === 'TEACHER' || user?.role === 'ADMIN';

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async () => {
    const question = input.trim();
    if (!question || loading) return;

    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: question }]);
    setLoading(true);

    try {
      const answer = await analyticsService.sendChatMessage(question);
      setMessages((prev) => [...prev, { role: 'ai', content: answer }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'ai', content: 'AI 서비스에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleExampleClick = (question: string) => {
    setInput(question);
    textareaRef.current?.focus();
  };

  // 교사/관리자가 아니면 제한 표시
  if (!canUse) {
    return (
      <Card className="opacity-60">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">AI 학습 도우미</CardTitle>
            <Badge variant="secondary" className="text-xs">
              교사/관리자 전용
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg bg-muted/50 p-4 text-center text-sm text-muted-foreground">
            AI 챗봇은 교사 및 관리자만 사용할 수 있습니다.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          <CardTitle className="text-base">AI 학습 도우미</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* 대화 영역 */}
        <div className="max-h-96 min-h-[200px] overflow-y-auto rounded-lg border bg-muted/20 p-3 space-y-3">
          {messages.length === 0 && !loading && (
            <div className="py-8 text-center text-sm text-muted-foreground">
              학생 데이터에 대해 질문해보세요.
            </div>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              className={cn(
                'flex gap-2',
                msg.role === 'user' ? 'justify-end' : 'justify-start',
              )}
            >
              {msg.role === 'ai' && (
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
              )}
              <div
                className={cn(
                  'max-w-[80%] rounded-lg px-3 py-2 text-sm',
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-background border',
                )}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
              {msg.role === 'user' && (
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted">
                  <User className="h-4 w-4 text-muted-foreground" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-2">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <Bot className="h-4 w-4 text-primary" />
              </div>
              <div className="flex items-center gap-2 rounded-lg border bg-background px-3 py-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                AI가 분석 중입니다...
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* 예시 질문 */}
        {messages.length === 0 && (
          <div className="flex flex-wrap gap-2">
            {EXAMPLE_QUESTIONS.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => handleExampleClick(q)}
                className="rounded-full border px-3 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {/* 입력 영역 */}
        <div className="flex gap-2">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="질문을 입력하세요 (Enter: 전송, Shift+Enter: 줄바꿈)"
            rows={1}
            className="flex-1 resize-none rounded-md border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            disabled={loading}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            size="icon"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default AiChatWidget;
