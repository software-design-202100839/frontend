import { Badge } from './ui/badge';

interface PrivacyBadgeProps {
  target: '학생' | '학부모';
  isPublic: boolean;
}

function PrivacyBadge({ target, isPublic }: PrivacyBadgeProps) {
  if (isPublic) {
    return <Badge className="bg-orange-100 text-orange-700 border-orange-200">{target} 공개</Badge>;
  }
  return (
    <Badge variant="outline" className="text-muted-foreground">
      {target} 비공개
    </Badge>
  );
}

export default PrivacyBadge;
