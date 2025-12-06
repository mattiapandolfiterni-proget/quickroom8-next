import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export default function Onboarding() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [preferences, setPreferences] = useState({
    user_type: 'seeker' as 'seeker' | 'owner' | 'tenant',
    is_smoker: false,
    has_pets: false,
    cleanliness_level: 'clean' as 'very_clean' | 'clean' | 'moderate' | 'relaxed',
    noise_tolerance: 'moderate' as 'very_quiet' | 'quiet' | 'moderate' | 'lively',
    social_preference: 'moderate' as 'very_social' | 'social' | 'moderate' | 'private',
    budget_min: 300,
    budget_max: 800,
    work_schedule: 'day' as 'day' | 'night' | 'flexible' | 'remote',
    party_friendly: false,
  });

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .update(preferences)
      .eq('id', user.id);

    if (error) {
      toast.error('Failed to save preferences');
    } else {
      toast.success('Profile completed!');
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Welcome to QuickRoom8!</CardTitle>
          <CardDescription>
            Let's set up your profile - Step {step} of 4
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">What brings you here?</h3>
              <RadioGroup
                value={preferences.user_type}
                onValueChange={(value) =>
                  setPreferences({ ...preferences, user_type: value as 'seeker' | 'owner' | 'tenant' })
                }
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="seeker" id="seeker" />
                  <Label htmlFor="seeker">I'm looking for a room</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="owner" id="owner" />
                  <Label htmlFor="owner">I have a room to rent</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="tenant" id="tenant" />
                  <Label htmlFor="tenant">I'm looking for a flatmate</Label>
                </div>
              </RadioGroup>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Your Lifestyle</h3>
              <div className="space-y-4">
                <div>
                  <Label>Do you smoke?</Label>
                  <RadioGroup
                    value={preferences.is_smoker ? 'yes' : 'no'}
                    onValueChange={(value) =>
                      setPreferences({ ...preferences, is_smoker: value === 'yes' })
                    }
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="no-smoke" />
                      <Label htmlFor="no-smoke">No</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="yes-smoke" />
                      <Label htmlFor="yes-smoke">Yes</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label>Do you have pets?</Label>
                  <RadioGroup
                    value={preferences.has_pets ? 'yes' : 'no'}
                    onValueChange={(value) =>
                      setPreferences({ ...preferences, has_pets: value === 'yes' })
                    }
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="no-pets" />
                      <Label htmlFor="no-pets">No</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="yes-pets" />
                      <Label htmlFor="yes-pets">Yes</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label>Are you party-friendly?</Label>
                  <RadioGroup
                    value={preferences.party_friendly ? 'yes' : 'no'}
                    onValueChange={(value) =>
                      setPreferences({ ...preferences, party_friendly: value === 'yes' })
                    }
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="no-party" />
                      <Label htmlFor="no-party">No</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="yes-party" />
                      <Label htmlFor="yes-party">Yes</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Living Preferences</h3>
              <div className="space-y-4">
                <div>
                  <Label>Cleanliness Level</Label>
                  <RadioGroup
                    value={preferences.cleanliness_level}
                    onValueChange={(value) =>
                      setPreferences({ ...preferences, cleanliness_level: value as 'very_clean' | 'clean' | 'moderate' | 'relaxed' })
                    }
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="very_clean" id="very-clean" />
                      <Label htmlFor="very-clean">Very Clean</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="clean" id="clean" />
                      <Label htmlFor="clean">Clean</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="moderate" id="moderate-clean" />
                      <Label htmlFor="moderate-clean">Moderate</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="relaxed" id="relaxed" />
                      <Label htmlFor="relaxed">Relaxed</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label>Social Preference</Label>
                  <RadioGroup
                    value={preferences.social_preference}
                    onValueChange={(value) =>
                      setPreferences({ ...preferences, social_preference: value as 'very_social' | 'social' | 'moderate' | 'private' })
                    }
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="very_social" id="very-social" />
                      <Label htmlFor="very-social">Very Social</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="social" id="social" />
                      <Label htmlFor="social">Social</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="moderate" id="moderate-social" />
                      <Label htmlFor="moderate-social">Moderate</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="private" id="private" />
                      <Label htmlFor="private">Private</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label>Noise Tolerance</Label>
                  <RadioGroup
                    value={preferences.noise_tolerance}
                    onValueChange={(value) =>
                      setPreferences({ ...preferences, noise_tolerance: value as 'very_quiet' | 'quiet' | 'moderate' | 'lively' })
                    }
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="very_quiet" id="very-quiet" />
                      <Label htmlFor="very-quiet">Very Quiet</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="quiet" id="quiet" />
                      <Label htmlFor="quiet">Quiet</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="moderate" id="moderate-noise" />
                      <Label htmlFor="moderate-noise">Moderate</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="lively" id="lively" />
                      <Label htmlFor="lively">Lively</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Budget & Schedule</h3>
              <div className="space-y-6">
                <div>
                  <Label>Budget Range (€{preferences.budget_min} - €{preferences.budget_max})</Label>
                  <div className="pt-4">
                    <Slider
                      min={200}
                      max={2000}
                      step={50}
                      value={[preferences.budget_min, preferences.budget_max]}
                      onValueChange={([min, max]) =>
                        setPreferences({ ...preferences, budget_min: min, budget_max: max })
                      }
                    />
                  </div>
                </div>

                <div>
                  <Label>Work Schedule</Label>
                  <RadioGroup
                    value={preferences.work_schedule}
                    onValueChange={(value) =>
                      setPreferences({ ...preferences, work_schedule: value as 'day' | 'night' | 'flexible' | 'remote' })
                    }
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="day" id="day" />
                      <Label htmlFor="day">Day Shift</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="night" id="night" />
                      <Label htmlFor="night">Night Shift</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="flexible" id="flexible" />
                      <Label htmlFor="flexible">Flexible</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="remote" id="remote" />
                      <Label htmlFor="remote">Remote</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between pt-4">
            {step > 1 && (
              <Button variant="outline" onClick={() => setStep(step - 1)}>
                Back
              </Button>
            )}
            <Button onClick={handleNext} className="ml-auto">
              {step === 4 ? 'Complete' : 'Next'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
