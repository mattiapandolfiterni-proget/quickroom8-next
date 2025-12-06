import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
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
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    
    const validationData = {
      full_name: formData.get('full_name') as string,
      age: formData.get('age') ? parseInt(formData.get('age') as string) : undefined,
      nationality: (formData.get('nationality') as string) || undefined,
      occupation: (formData.get('occupation') as string) || undefined,
      bio: (formData.get('bio') as string) || undefined,
      budget_min: formData.get('budget_min') ? parseInt(formData.get('budget_min') as string) : undefined,
      budget_max: formData.get('budget_max') ? parseInt(formData.get('budget_max') as string) : undefined,
    };

    try {
      const result = profileSchema.safeParse(validationData);
      if (!result.success) {
        toast({
          title: "Validation Error",
          description: result.error.errors[0].message,
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const updates = {
        id: user.id,
        full_name: formData.get('full_name') as string,
        age: parseInt(formData.get('age') as string) || undefined,
        nationality: (formData.get('nationality') as string) || undefined,
        occupation: (formData.get('occupation') as string) || undefined,
        bio: (formData.get('bio') as string) || undefined,
        gender: formData.get('gender') as string || undefined,
        languages: formData.get('languages') ? (formData.get('languages') as string).split(',').map(l => l.trim()) : undefined,
        is_smoker: formData.get('is_smoker') === 'true',
        has_pets: formData.get('has_pets') === 'true',
        cleanliness_level: (formData.get('cleanliness_level') as string) || undefined,
        noise_tolerance: (formData.get('noise_tolerance') as string) || undefined,
        wake_up_time: (formData.get('wake_up_time') as string) || undefined,
        bed_time: (formData.get('bed_time') as string) || undefined,
        social_preference: (formData.get('social_preference') as string) || undefined,
        work_schedule: (formData.get('work_schedule') as string) || undefined,
        budget_min: parseInt(formData.get('budget_min') as string) || undefined,
        budget_max: parseInt(formData.get('budget_max') as string) || undefined,
        preferred_room_type: (formData.get('preferred_room_type') as string) || undefined,
        preferred_locations: formData.get('preferred_locations') ? (formData.get('preferred_locations') as string).split(',').map(l => l.trim()) : undefined,
        must_have_amenities: formData.get('must_have_amenities') ? (formData.get('must_have_amenities') as string).split(',').map(a => a.trim()) : undefined,
        updated_at: new Date().toISOString(),
      } as any;

      const { error } = await supabase
        .from('profiles')
        .upsert([updates]);

      if (error) throw error;

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container max-w-2xl">
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
    </div>
  );
};

export default Profile;
