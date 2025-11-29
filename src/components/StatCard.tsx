import { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'destructive';
}

export default function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  trendValue,
  variant = 'default'
}: StatCardProps) {
  const variantStyles = {
    default: 'bg-card text-card-foreground',
    primary: 'bg-primary/10 text-primary border-primary/20',
    success: 'bg-success/10 text-success border-success/20',
    warning: 'bg-warning/10 text-warning border-warning/20',
    destructive: 'bg-destructive/10 text-destructive border-destructive/20'
  };

  return (
    <Card className={cn('p-6', variantStyles[variant])}>
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium opacity-70">{title}</p>
          <p className="text-3xl font-bold">{value}</p>
          {description && (
            <p className="text-xs opacity-60">{description}</p>
          )}
          {trend && trendValue && (
            <div className="flex items-center gap-1 text-xs">
              <span className={cn(
                'font-medium',
                trend === 'up' && 'text-success',
                trend === 'down' && 'text-destructive',
                trend === 'neutral' && 'text-muted-foreground'
              )}>
                {trend === 'up' && '↑'}
                {trend === 'down' && '↓'}
                {trend === 'neutral' && '→'}
                {trendValue}
              </span>
              <span className="opacity-60">vs last hour</span>
            </div>
          )}
        </div>
        <div className={cn(
          'p-3 rounded-lg',
          variant === 'default' && 'bg-primary/10',
          variant !== 'default' && 'bg-background/50'
        )}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </Card>
  );
}
