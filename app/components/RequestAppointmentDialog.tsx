import { useState } from 'react';
import { Calendar, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface RequestAppointmentDialogProps {
  listingId: string;
  ownerId: string;
}

export const RequestAppointmentDialog = ({ listingId, ownerId }: RequestAppointmentDialogProps) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState('10:00');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to request a viewing",
        variant: "destructive",
      });
      return;
    }

    if (!date) {
      toast({
        title: "Date Required",
        description: "Please select a date and time",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const [hours, minutes] = time.split(':');
      const appointmentDate = new Date(date);
      appointmentDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      // Validate appointment is in the future
      if (appointmentDate <= new Date()) {
        toast({
          title: "Invalid Date",
          description: "Please select a future date and time",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const appointmentPayload = {
        listing_id: listingId,
        owner_id: ownerId,
        requester_id: user.id,
        appointment_date: appointmentDate.toISOString(),
        notes: notes.trim() || null,
        status: 'pending', // Explicitly set status
      };

      console.log('[Appointment] Creating appointment:', JSON.stringify(appointmentPayload, null, 2));

      // Insert appointment with explicit status field and verify return
      const { data, error } = await supabase
        .from('viewing_appointments')
        .insert(appointmentPayload)
        .select('*')
        .single();

      if (error) {
        console.error('[Appointment] Insert error:', error);
        throw new Error(error.message || 'Failed to create appointment');
      }

      // CRITICAL: Verify the appointment was actually created
      if (!data || !data.id) {
        console.error('[Appointment] No data returned after insert');
        throw new Error('Appointment creation failed - no confirmation received');
      }

      console.log('[Appointment] Created successfully with ID:', data.id);

      // Create notification for owner (non-blocking but logged)
      const { error: notifError } = await supabase.from('notifications').insert({
        user_id: ownerId,
        title: 'New Viewing Request',
        content: `You have a new viewing request for ${format(appointmentDate, 'PPP')} at ${time}`,
        type: 'appointment',
        link: '/appointments'
      });

      if (notifError) {
        console.warn('[Appointment] Notification failed (non-critical):', notifError);
      }

      toast({
        title: "Request Sent!",
        description: `Your viewing request for ${format(appointmentDate, 'PPP')} has been sent. ID: ${data.id.slice(0, 8)}`,
      });

      setOpen(false);
      setDate(undefined);
      setTime('10:00');
      setNotes('');
    } catch (error: any) {
      const errorMessage = error?.message || error?.toString?.() || "Please try again later";
      console.error('[Appointment] Request failed:', errorMessage, error);
      toast({
        title: "Failed to Request Viewing",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          Request Viewing
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Request a Viewing</DialogTitle>
          <DialogDescription>
            Choose a date and time for your viewing appointment
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label>Select Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !date && 'text-muted-foreground'
                  )}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {date ? format(date, 'PPP') : 'Pick a date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="time">Select Time</Label>
            <select
              id="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full p-2 border rounded-md bg-background"
            >
              {Array.from({ length: 24 }, (_, i) => {
                const hour = i.toString().padStart(2, '0');
                return (
                  <option key={`${hour}:00`} value={`${hour}:00`}>
                    {hour}:00
                  </option>
                );
              })}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Any specific requirements or questions..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            className="flex-1"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="flex-1" disabled={loading || !date}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              'Send Request'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
