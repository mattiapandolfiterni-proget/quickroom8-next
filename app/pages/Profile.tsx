import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ReviewsList } from '@/components/ReviewsList';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Loader2, User, Plus } from 'lucide-react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { z } from 'zod';

const profileSchema = z.object({
  full_name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  age: z.number().min(18, 'Must be at least 18').max(120, 'Invalid age').optional(),
  nationality: z.string().max(100, 'Nationality too long').optional(),
  occupation: z.string().max(100, 'Occupation too long').optional(),
  bio: z.string().max(1000, 'Bio too long').optional(),
  budget_min: z.number().min(0).max(100000).optional(),
  budget_max: z.number().min(0).max(100000).optional(),
}).refine((data) => {
  if (data.budget_min && data.budget_max) {
    return data.budget_min <= data.budget_max;
  }
  return true;
}, {
  message: "Maximum budget must be greater than minimum budget",
  path: ["budget_max"],
});

const Profile = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-12 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const fetchProfile = async () => {
    setProfileLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      // Handle case where profile doesn't exist (PGRST116 = not found)
      if (error && error.code === 'PGRST116') {
        // Profile doesn't exist, create one
        console.log('[Profile] No profile found, creating one...');
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({ 
            id: user.id, 
            email: user.email,
            full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'
          })
          .select('*')
          .single();

        if (createError) {
          console.error('[Profile] Failed to create profile:', createError);
          throw createError;
        }
        
        setProfile(newProfile);
        return;
      }

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Error",
        description: "Failed to load profile data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProfileLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    
    // Helper functions for proper value extraction
    const getString = (key: string): string | null => {
      const value = formData.get(key) as string;
      return value && value.trim() !== '' ? value.trim() : null;
    };
    
    const getNumber = (key: string): number | null => {
      const value = formData.get(key) as string;
      if (!value || value.trim() === '') return null;
      const num = parseInt(value, 10);
      return isNaN(num) ? null : num;
    };
    
    const getArray = (key: string): string[] | null => {
      const value = formData.get(key) as string;
      if (!value || value.trim() === '') return null;
      const arr = value.split(',').map(l => l.trim()).filter(Boolean);
      return arr.length > 0 ? arr : null;
    };
    
    // Build validation data
    const validationData = {
      full_name: getString('full_name') || '',
      age: getNumber('age') ?? undefined,
      nationality: getString('nationality') ?? undefined,
      occupation: getString('occupation') ?? undefined,
      bio: getString('bio') ?? undefined,
      budget_min: getNumber('budget_min') ?? undefined,
      budget_max: getNumber('budget_max') ?? undefined,
    };

    try {
      const result = profileSchema.safeParse(validationData);
      if (!result.success) {
        toast({
          title: "Validation Error",
          description: result.error.issues[0].message,
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Build complete update object - use null for empty values to clear them
      const updates: Record<string, any> = {
        full_name: getString('full_name'),
        age: getNumber('age'),
        nationality: getString('nationality'),
        occupation: getString('occupation'),
        bio: getString('bio'),
        gender: getString('gender'),
        languages: getArray('languages'),
        is_smoker: formData.get('is_smoker') === 'true',
        has_pets: formData.get('has_pets') === 'true',
        cleanliness_level: getString('cleanliness_level'),
        noise_tolerance: getString('noise_tolerance'),
        wake_up_time: getString('wake_up_time'),
        bed_time: getString('bed_time'),
        social_preference: getString('social_preference'),
        work_schedule: getString('work_schedule'),
        budget_min: getNumber('budget_min'),
        budget_max: getNumber('budget_max'),
        preferred_room_type: getString('preferred_room_type'),
        preferred_locations: getArray('preferred_locations'),
        must_have_amenities: getArray('must_have_amenities'),
        // Let DB handle updated_at with default/trigger, or remove if not auto-managed
      };

      console.log('[Profile] Updating profile for user:', user.id);
      console.log('[Profile] Update payload:', JSON.stringify(updates, null, 2));

      // Use UPDATE with explicit select to get the persisted data back
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select('*')
        .single();

      if (error) {
        console.error('[Profile] Update error:', error);
        throw new Error(error.message || 'Database update failed');
      }

      // CRITICAL: Verify data was actually returned
      if (!data) {
        console.error('[Profile] No data returned after update');
        throw new Error('Profile update completed but no data returned. Please refresh the page.');
      }

      console.log('[Profile] Update successful, returned data:', data.id);

      // Update local state with the DB-confirmed data (source of truth)
      setProfile(data);

      toast({
        title: "Profile updated",
        description: "Your profile has been saved successfully.",
      });
    } catch (error: any) {
      const errorMessage = error?.message || error?.toString?.() || "Failed to update profile";
      console.error('[Profile] Save error:', errorMessage, error);
      toast({
        title: "Error Saving Profile",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      {profileLoading ? (
        <div className="container py-12 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
      <div className="container max-w-2xl py-12">
        <div className="flex items-center justify-between gap-3 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-display font-bold">My Profile</h1>
              <p className="text-muted-foreground">Manage your personal information</p>
            </div>
          </div>
          <Button 
            onClick={() => navigate('/list-room')}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            List a Room
          </Button>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile">Profile Settings</TabsTrigger>
            <TabsTrigger value="reviews">My Reviews</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name *</Label>
                  <Input
                    id="full_name"
                    name="full_name"
                    defaultValue={profile?.full_name || ''}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="age">Age *</Label>
                  <Input
                    id="age"
                    name="age"
                    type="number"
                    defaultValue={profile?.age || ''}
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <select
                    id="gender"
                    name="gender"
                    defaultValue={profile?.gender || ''}
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2"
                  >
                    <option value="">Select...</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer_not_to_say">Prefer not to say</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nationality">Nationality</Label>
                  <Input
                    id="nationality"
                    name="nationality"
                    defaultValue={profile?.nationality || ''}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="occupation">Occupation</Label>
                  <Input
                    id="occupation"
                    name="occupation"
                    defaultValue={profile?.occupation || ''}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="languages">Languages (comma separated)</Label>
                  <Input
                    id="languages"
                    name="languages"
                    defaultValue={profile?.languages?.join(', ') || ''}
                    placeholder="English, Italian, Spanish"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  defaultValue={profile?.bio || ''}
                  rows={3}
                  placeholder="Tell us about yourself..."
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Lifestyle Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="is_smoker">Do you smoke?</Label>
                  <select
                    id="is_smoker"
                    name="is_smoker"
                    defaultValue={profile?.is_smoker?.toString() || 'false'}
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2"
                  >
                    <option value="false">No</option>
                    <option value="true">Yes</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="has_pets">Do you have pets?</Label>
                  <select
                    id="has_pets"
                    name="has_pets"
                    defaultValue={profile?.has_pets?.toString() || 'false'}
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2"
                  >
                    <option value="false">No</option>
                    <option value="true">Yes</option>
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cleanliness_level">Cleanliness Level</Label>
                  <select
                    id="cleanliness_level"
                    name="cleanliness_level"
                    defaultValue={profile?.cleanliness_level || ''}
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2"
                  >
                    <option value="">Select...</option>
                    <option value="very_clean">Very Clean</option>
                    <option value="clean">Clean</option>
                    <option value="moderate">Moderate</option>
                    <option value="relaxed">Relaxed</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="noise_tolerance">Noise Tolerance</Label>
                  <select
                    id="noise_tolerance"
                    name="noise_tolerance"
                    defaultValue={profile?.noise_tolerance || ''}
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2"
                  >
                    <option value="">Select...</option>
                    <option value="very_quiet">Very Quiet</option>
                    <option value="quiet">Quiet</option>
                    <option value="moderate">Moderate</option>
                    <option value="lively">Lively</option>
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="social_preference">Social Preference</Label>
                  <select
                    id="social_preference"
                    name="social_preference"
                    defaultValue={profile?.social_preference || ''}
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2"
                  >
                    <option value="">Select...</option>
                    <option value="very_social">Very Social</option>
                    <option value="social">Social</option>
                    <option value="moderate">Moderate</option>
                    <option value="private">Private</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="work_schedule">Work Schedule</Label>
                  <select
                    id="work_schedule"
                    name="work_schedule"
                    defaultValue={profile?.work_schedule || ''}
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2"
                  >
                    <option value="">Select...</option>
                    <option value="day">Day</option>
                    <option value="night">Night</option>
                    <option value="flexible">Flexible</option>
                    <option value="remote">Remote</option>
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="wake_up_time">Wake Up Time</Label>
                  <Input
                    id="wake_up_time"
                    name="wake_up_time"
                    type="time"
                    defaultValue={profile?.wake_up_time || ''}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bed_time">Bed Time</Label>
                  <Input
                    id="bed_time"
                    name="bed_time"
                    type="time"
                    defaultValue={profile?.bed_time || ''}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Room Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="budget_min">Budget Min (€)</Label>
                  <Input
                    id="budget_min"
                    name="budget_min"
                    type="number"
                    defaultValue={profile?.budget_min || ''}
                    placeholder="e.g., 400"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="budget_max">Budget Max (€)</Label>
                  <Input
                    id="budget_max"
                    name="budget_max"
                    type="number"
                    defaultValue={profile?.budget_max || ''}
                    placeholder="e.g., 800"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="preferred_room_type">Preferred Room Type</Label>
                  <select
                    id="preferred_room_type"
                    name="preferred_room_type"
                    defaultValue={profile?.preferred_room_type || ''}
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2"
                  >
                    <option value="">No preference</option>
                    <option value="private">Private Room</option>
                    <option value="shared">Shared Room</option>
                    <option value="studio">Studio</option>
                    <option value="ensuite">Ensuite</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="preferred_locations">Preferred Locations (comma separated)</Label>
                  <Input
                    id="preferred_locations"
                    name="preferred_locations"
                    defaultValue={profile?.preferred_locations?.join(', ') || ''}
                    placeholder="e.g., Sliema, St. Julian's, Valletta"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="must_have_amenities">Must-Have Amenities (comma separated)</Label>
                <Input
                  id="must_have_amenities"
                  name="must_have_amenities"
                  defaultValue={profile?.must_have_amenities?.join(', ') || ''}
                  placeholder="WiFi, AC, Parking"
                />
              </div>
            </CardContent>
          </Card>

              <Button type="submit" className="w-full h-12 text-base" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save All Changes
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="reviews">
            <Card>
              <CardHeader>
                <CardTitle>Reviews About You</CardTitle>
              </CardHeader>
              <CardContent>
                <ReviewsList userId={user.id} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      )}
    </div>
  );
};

export default Profile;
