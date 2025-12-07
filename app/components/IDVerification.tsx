import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client.ts';
import { toast } from '@/hooks/use-toast';
import { Shield, Upload, Check, Clock, X, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface IDVerificationProps {
  profile: any;
  onVerificationSubmit: () => void;
}

export const IDVerification = ({ profile, onVerificationSubmit }: IDVerificationProps) => {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [verificationRequest, setVerificationRequest] = useState<any>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a JPG, PNG, or PDF file.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      // Upload to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('verification-documents')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('verification-documents')
        .getPublicUrl(fileName);

      // Create verification request
      const { error: requestError } = await supabase
        .from('verification_requests')
        .insert({
          user_id: user.id,
          verification_type: 'id_verification',
          document_url: publicUrl,
          status: 'pending',
        });

      if (requestError) throw requestError;

      toast({
        title: "Verification request submitted",
        description: "Your ID verification request has been submitted. We'll review it within 24-48 hours.",
      });

      onVerificationSubmit();
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500"><Check className="w-3 h-3 mr-1" /> Verified</Badge>;
      case 'pending':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" /> Pending Review</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><X className="w-3 h-3 mr-1" /> Rejected</Badge>;
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              ID Verification (Optional)
            </CardTitle>
            <CardDescription>
              Verify your identity to gain trust and visibility in the community
            </CardDescription>
          </div>
          {profile?.is_id_verified && (
            <Badge className="bg-green-500">
              <Check className="w-3 h-3 mr-1" /> Verified
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-accent/50 p-4 rounded-lg space-y-3">
          <h4 className="font-semibold text-sm">Benefits of ID Verification:</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 mt-0.5 text-green-500 flex-shrink-0" />
              <span>Display a "Verified" badge on your profile and listings</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 mt-0.5 text-green-500 flex-shrink-0" />
              <span>Increased trust from other users</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 mt-0.5 text-green-500 flex-shrink-0" />
              <span>Higher visibility in search results</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 mt-0.5 text-green-500 flex-shrink-0" />
              <span>Priority support from our team</span>
            </li>
          </ul>
        </div>

        <div className="bg-muted/50 p-4 rounded-lg space-y-2 text-sm">
          <h4 className="font-semibold">How We Handle Your ID:</h4>
          <ul className="space-y-1 text-muted-foreground">
            <li>• Documents are encrypted and securely stored</li>
            <li>• Deleted within 90 days after verification</li>
            <li>• Your ID details are never shared with other users</li>
            <li>• Full GDPR compliance</li>
          </ul>
        </div>

        {!profile?.is_id_verified && (
          <div className="space-y-3">
            <div className="text-sm text-muted-foreground">
              <strong>Accepted documents:</strong> National ID, Passport, Driver's License (JPG, PNG, or PDF, max 5MB)
            </div>
            <div>
              <input
                type="file"
                id="id-upload"
                accept="image/jpeg,image/jpg,image/png,application/pdf"
                onChange={handleFileUpload}
                className="hidden"
                disabled={uploading}
              />
              <label htmlFor="id-upload">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  disabled={uploading}
                  onClick={() => document.getElementById('id-upload')?.click()}
                  asChild
                >
                  <span>
                    {uploading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Upload ID Document
                      </>
                    )}
                  </span>
                </Button>
              </label>
            </div>
          </div>
        )}

        {profile?.is_id_verified && (
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
              <Shield className="w-5 h-5" />
              <span className="font-semibold">Your identity has been verified!</span>
            </div>
            <p className="text-sm text-green-600 dark:text-green-500 mt-2">
              Your profile now displays a verified badge, giving you increased trust and visibility.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
