import { Badge } from '@/components/ui/badge';
import { LeadStatus } from '@/types/lead';

interface LeadStatusBadgeProps {
  status: LeadStatus;
}

const statusStyles: Record<LeadStatus, string> = {
  'New': 'bg-blue-100 text-blue-800 hover:bg-blue-100',
  'Engaged': 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
  'Proposal Sent': 'bg-purple-100 text-purple-800 hover:bg-purple-100',
  'Closed-Won': 'bg-green-100 text-green-800 hover:bg-green-100',
  'Closed-Lost': 'bg-red-100 text-red-800 hover:bg-red-100',
};

export function LeadStatusBadge({ status }: LeadStatusBadgeProps) {
  return (
    <Badge variant="secondary" className={statusStyles[status]}>
      {status}
    </Badge>
  );
}