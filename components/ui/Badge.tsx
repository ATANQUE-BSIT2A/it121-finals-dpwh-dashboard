interface BadgeProps {
  status: string | null;
  className?: string;
}

export default function Badge({ status, className = '' }: BadgeProps) {
  const statusConfig: Record<string, string> = {
    'Completed': 'glass-badge badge-completed',
    'On-Going': 'glass-badge badge-ongoing',
    'Suspended': 'glass-badge badge-suspended',
    'Terminated': 'glass-badge badge-terminated',
  };

  return (
    <span className={statusConfig[status || ''] || 'glass-badge'}>
      {status || 'Unknown'}
    </span>
  );
}
