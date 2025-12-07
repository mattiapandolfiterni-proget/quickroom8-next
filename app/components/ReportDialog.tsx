import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { supabase } from '@/integrations/supabase/client.ts';
import { toast } from '@/hooks/use-toast';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ReportDialogProps {
  type: 'listing' | 'message' | 'user';
  targetId: string;
  triggerButton?: React.ReactNode;
}

const REPORT_REASONS = {
  listing: [
    'Fake listing',
    'Misleading information',
    'Inappropriate content',
    'Scam or fraud',
    'Wrong location',
    'Other',
  ],
  message: [
    'Harassment',
    'Spam',
    'Inappropriate content',
    'Threatening behavior',
    'Other',
  ],
  user: [
    'Fake profile',
    'Harassment',
    'Scam or fraud',
    'Inappropriate behavior',
    'Spam',
    'Other',
  ],
};

export const ReportDialog = ({ type, targetId, triggerButton }: ReportDialogProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      navigate('/auth');
      return;
    }

    if (!reason) {
      toast({
        title: 'Reason Required',
        description: 'Please select a reason for your report',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSubmitting(true);

      const reportData: any = {
        reporter_id: user.id,
        reason,
        description: description.trim() || null,
        status: 'pending',
      };

      // Add the appropriate target ID based on type
      if (type === 'listing') {
        reportData.reported_listing_id = targetId;
      } else if (type === 'message') {
        reportData.reported_message_id = targetId;
      } else if (type === 'user') {
        reportData.reported_user_id = targetId;
      }

      const { error } = await supabase.from('reports').insert([reportData]);

      if (error) throw error;

      toast({
        title: 'Report Submitted',
        description: 'Thank you for reporting. We will review this shortly.',
      });

      setOpen(false);
      setReason('');
      setDescription('');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerButton || (
          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
            <AlertTriangle className="w-4 h-4 mr-2" />
            Report
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            Report {type.charAt(0).toUpperCase() + type.slice(1)}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            <Label>Reason for report *</Label>
            <RadioGroup value={reason} onValueChange={setReason}>
              {REPORT_REASONS[type].map((r) => (
                <div key={r} className="flex items-center space-x-2">
                  <RadioGroupItem value={r} id={r} />
                  <Label htmlFor={r} className="font-normal cursor-pointer">
                    {r}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Additional details (optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide more information about why you're reporting this..."
              rows={4}
            />
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting || !reason}
              className="flex-1"
              variant="destructive"
            >
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Report
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
