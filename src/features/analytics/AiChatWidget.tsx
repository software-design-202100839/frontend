import { useState, useRef, useEffect, type KeyboardEvent } from 'react';
import { Bot, Send, User, Loader2, X, MessageCircle, Trash2 } from 'lucide-react';
import analyticsService from '../../services/analyticsService';
import authService from '../../services/authService';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ChatMessage {
  role: 'user' | 'ai';
  content: string;
}

const EXAMPLE_QUESTIONS_BY_ROLE: Record<string, string[]> = {
  TEACHER: ['테스트학생의 성적 추이를 알려줘', '위험도가 높은 학생이 있어?', '1학년 1반 학생 목록'],
  ADMIN: ['테스트학생의 성적 추이를 알려줘', '위험도가 높은 학생이 있어?', '1학년 1반 학생 목록'],
  STUDENT: ['내 성적 추이를 알려줘', '이번 학기 피드백 보여줘', '내 출결 현황은?'],
  PARENT: ['우리 아이 성적이 어때?', '이번 학기 피드백 있어?', '상담 내역 알려줘'],
};

const PLACEHOLDER_BY_ROLE: Record<string, string> = {
  TEACHER: '학생 데이터에 대해 질문해보세요',
  ADMIN: '학생 데이터에 대해 질문해보세요',
  STUDENT: '나의 학습 현황을 물어보세요',
  PARENT: '자녀의 학습 현황을 물어보세요',
};

const STORAGE_KEY_MESSAGES = 'sscm-chat-messages';
const STORAGE_KEY_SESSION = 'sscm-chat-sessionId';

function AiChatWidget() {
  const user = authService.getStoredUser();
  const role = user?.role || 'STUDENT';

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_MESSAGES);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | undefined>(() => {
    return localStorage.getItem(STORAGE_KEY_SESSION) || undefined;
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const exampleQuestions = EXAMPLE_QUESTIONS_BY_ROLE[role] || EXAMPLE_QUESTIONS_BY_ROLE.STUDENT;
  const placeholder = PLACEHOLDER_BY_ROLE[role] || PLACEHOLDER_BY_ROLE.STUDENT;

  // Persist messages to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(messages));
  }, [messages]);

  // Persist sessionId to localStorage
  useEffect(() => {
    if (sessionId) {
      localStorage.setItem(STORAGE_KEY_SESSION, sessionId);
    }
  }, [sessionId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleClearChat = () => {
    setMessages([]);
    setSessionId(undefined);
    localStorage.removeItem(STORAGE_KEY_MESSAGES);
    localStorage.removeItem(STORAGE_KEY_SESSION);
  };

  const handleSend = async () => {
    const question = input.trim();
    if (!question || loading) {
      return;
    }

    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: question }]);
    setLoading(true);

    try {
      const response = await analyticsService.sendChatMessage(question, sessionId);
      setSessionId(response.sessionId);
      setMessages((prev) => [...prev, { role: 'ai', content: response.answer }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'ai',
          content: 'AI 서비스에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.',
        },
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

  if (!user) {
    return null;
  }

  // Closed state: floating button
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-primary text-white shadow-lg hover:bg-primary/90 transition-colors flex items-center justify-center"
      >
        <MessageCircle className="h-6 w-6" />
      </button>
    );
  }

  // Open state: chat window
  return (
    <>
      {/* Chat window */}
      <div className="fixed bottom-24 right-6 z-50 w-96 max-h-[600px] rounded-xl border bg-background shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            <span className="font-semibold text-sm">AI 학습 도우미</span>
          </div>
          <div className="flex items-center gap-1">
            {messages.length > 0 && (
              <button
                onClick={handleClearChat}
                className="rounded-md p-1.5 text-muted-foreground hover:bg-muted transition-colors"
                title="대화 초기화"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-md p-1.5 text-muted-foreground hover:bg-muted transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-[200px] max-h-[400px]">
          {messages.length === 0 && !loading && (
            <div className="py-8 text-center text-sm text-muted-foreground">{placeholder}</div>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              className={cn('flex gap-2', msg.role === 'user' ? 'justify-end' : 'justify-start')}
            >
              {msg.role === 'ai' && (
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
              )}
              <div
                className={cn(
                  'max-w-[80%] rounded-lg px-3 py-2 text-sm',
                  msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted border',
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

        {/* Example questions (only when no messages) */}
        {messages.length === 0 && (
          <div className="flex flex-wrap gap-1.5 px-3 pb-2">
            {exampleQuestions.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => handleExampleClick(q)}
                className="rounded-full border px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {/* Input area */}
        <div className="border-t p-3">
          <div className="flex gap-2">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="질문을 입력하세요 (Enter: 전송)"
              rows={1}
              className="flex-1 resize-none rounded-md border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              disabled={loading}
            />
            <Button onClick={handleSend} disabled={!input.trim() || loading} size="icon">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Floating button (still visible when open) */}
      <button
        onClick={() => setIsOpen(false)}
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-primary text-white shadow-lg hover:bg-primary/90 transition-colors flex items-center justify-center"
      >
        <X className="h-6 w-6" />
      </button>
    </>
  );
}

export default AiChatWidget;
