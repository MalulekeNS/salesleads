import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { LeadForm } from './LeadForm';
import { Lead } from '@/types/lead';

interface LeadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead?: Lead;
  onSubmit: (values: { name: string; email: string; status: Lead['status'] }) => Promise<void>;
  isSubmitting?: boolean;
}

export function LeadDialog({ 
  open, 
  onOpenChange, 
  lead, 
  onSubmit,
  isSubmitting 
}: LeadDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{lead ? 'Edit Lead' : 'Create New Lead'}</DialogTitle>
          <DialogDescription>
            {lead 
              ? 'Update the lead information below.' 
              : 'Add a new lead to your pipeline.'}
          </DialogDescription>
        </DialogHeader>
        <LeadForm
          lead={lead}
          onSubmit={onSubmit}
          onCancel={() => onOpenChange(false)}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
}