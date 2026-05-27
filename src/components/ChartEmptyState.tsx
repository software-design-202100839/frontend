import { BarChart3 } from 'lucide-react';

interface ChartEmptyStateProps {
  condition: string;
  height?: number;
}

function ChartEmptyState({ condition, height = 250 }: ChartEmptyStateProps) {
  return (
    <div
      className="flex flex-col items-center justify-center rounded-lg border border-dashed text-center"
      style={{ height }}
    >
      <BarChart3 className="mb-2 h-8 w-8 text-muted-foreground/50" />
      <p className="text-sm text-muted-foreground">{condition}</p>
    </div>
  );
}

export default ChartEmptyState;
