interface BadgeProps {
  status: string | null;
  className?: string;
}

export default function Badge({ status, className = '' }: BadgeProps) {
  const statusConfig: Record<string, string> = {
    Completed: 'bg-status-completed/20 text-status-completed border border-status-completed/30',
    'On-Going': 'bg-status-ongoing/20 text-status-ongoing border border-status-ongoing/30',
    Suspended: 'bg-status-suspended/20 text-status-suspended border border-status-suspended/30',
    Terminated: 'bg-status-terminated/20 text-status-terminated border border-status-terminated/30',
  };

  const defaultConfig = 'bg-gray-500/20 text-gray-400 border border-gray-500/30';

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusConfig[status || ''] || defaultConfig} ${className}`}>
      {status || 'Unknown'}
    </span>
  );
}
