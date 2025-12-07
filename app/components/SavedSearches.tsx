import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client.ts';
import { toast } from '@/hooks/use-toast';
import { Search, Trash2, Bell, BellOff, Loader2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export const SavedSearches = () => {
  const { user } = useAuth();
  const [searches, setSearches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchSavedSearches();
    }
  }, [user]);

  const fetchSavedSearches = async () => {
    try {
      const { data, error } = await supabase
        .from('saved_searches')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSearches(data || []);
    } catch (error) {
      console.error('Error fetching saved searches:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleNotifications = async (searchId: string, currentValue: boolean) => {
    try {
      const { error } = await supabase
        .from('saved_searches')
        .update({ notify_new_matches: !currentValue })
        .eq('id', searchId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Notifications ${!currentValue ? 'enabled' : 'disabled'}`,
      });

      fetchSavedSearches();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const deleteSearch = async () => {
    if (!deleteId) return;

    try {
      const { error } = await supabase
        .from('saved_searches')
        .delete()
        .eq('id', deleteId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Saved search deleted',
      });

      fetchSavedSearches();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setDeleteId(null);
    }
  };

  const renderFilters = (filters: any) => {
    const badges = [];
    
    if (filters.location) badges.push(`Location: ${filters.location}`);
    if (filters.minPrice && filters.maxPrice) {
      badges.push(`€${filters.minPrice}-€${filters.maxPrice}`);
    } else if (filters.minPrice) {
      badges.push(`Min: €${filters.minPrice}`);
    } else if (filters.maxPrice) {
      badges.push(`Max: €${filters.maxPrice}`);
    }
    if (filters.roomType) badges.push(filters.roomType);
    if (filters.contractType) badges.push(filters.contractType);
    if (filters.hasWifi) badges.push('WiFi');
    if (filters.hasParking) badges.push('Parking');
    if (filters.isPetFriendly) badges.push('Pet Friendly');
    if (filters.isFurnished) badges.push('Furnished');

    return badges.length > 0 ? badges : ['No filters'];
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (searches.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Search className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No saved searches</h3>
          <p className="text-muted-foreground">
            Save your searches to get notified when new listings match your criteria
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {searches.map((search) => (
          <Card key={search.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Search className="w-5 h-5 text-primary" />
                    {search.name}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Created {new Date(search.created_at).toLocaleDateString()}
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setDeleteId(search.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {renderFilters(search.filters).map((filter, index) => (
                    <Badge key={index} variant="secondary">
                      {filter}
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center gap-2">
                    {search.notify_new_matches ? (
                      <Bell className="w-4 h-4 text-primary" />
                    ) : (
                      <BellOff className="w-4 h-4 text-muted-foreground" />
                    )}
                    <Label htmlFor={`notify-${search.id}`} className="cursor-pointer">
                      Notify me of new matches
                    </Label>
                  </div>
                  <Switch
                    id={`notify-${search.id}`}
                    checked={search.notify_new_matches}
                    onCheckedChange={() =>
                      toggleNotifications(search.id, search.notify_new_matches)
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Saved Search</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this saved search? You'll no longer receive
              notifications for new matches.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={deleteSearch}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
