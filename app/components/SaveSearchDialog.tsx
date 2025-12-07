import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client.ts';
import { toast } from '@/hooks/use-toast';
import { Bookmark, Loader2 } from 'lucide-react';

interface SaveSearchDialogProps {
  filters: any;
}

export const SaveSearchDialog = ({ filters }: SaveSearchDialogProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [notifyNewMatches, setNotifyNewMatches] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      navigate('/auth');
      return;
    }

    if (!name.trim()) {
      toast({
        title: 'Name Required',
        description: 'Please enter a name for this search',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSubmitting(true);

      const { error } = await supabase.from('saved_searches').insert([
        {
          user_id: user.id,
          name: name.trim(),
          filters,
          notify_new_matches: notifyNewMatches,
        },
      ]);

      if (error) throw error;

      toast({
        title: 'Search Saved',
        description: notifyNewMatches
          ? "You'll be notified when new listings match your criteria"
          : 'Search saved successfully',
      });

      setOpen(false);
      setName('');
      setNotifyNewMatches(true);
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
        <Button variant="outline" size="sm">
          <Bookmark className="w-4 h-4 mr-2" />
          Save Search
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Save This Search</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Search Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Central Sliema Apartments"
              required
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <div className="space-y-0.5">
              <Label htmlFor="notify">Notify me of new matches</Label>
              <p className="text-sm text-muted-foreground">
                Get alerts when new listings match your criteria
              </p>
            </div>
            <Switch
              id="notify"
              checked={notifyNewMatches}
              onCheckedChange={setNotifyNewMatches}
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={submitting} className="flex-1">
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Search
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
