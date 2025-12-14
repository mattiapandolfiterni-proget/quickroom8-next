import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Rocket, Clock } from 'lucide-react';

interface BoostListingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listingId: string;
  listingTitle: string;
}

const BOOST_PACKAGES = [
  {
    id: '24h',
    name: '24 Hours',
    duration: 24,
    price: 5,
    priceId: 'price_1SX0BaRqiqHZ2M51q5jUAs46',
    description: 'Perfect for a quick boost',
  },
  {
    id: '48h',
    name: '48 Hours',
    duration: 48,
    price: 9,
    priceId: 'price_1SX0CCRqiqHZ2M511Vlj0NVs',
    description: 'Best value for 2 days',
    popular: true,
  },
  {
    id: '7d',
    name: '7 Days',
    duration: 168,
    price: 25,
    priceId: 'price_1SX0CNRqiqHZ2M51uecT8j40',
    description: 'Maximum visibility for a week',
  },
];

export const BoostListingDialog = ({ open, onOpenChange, listingId, listingTitle }: BoostListingDialogProps) => {
  const [selectedPackage, setSelectedPackage] = useState(BOOST_PACKAGES[1].id);
  const [loading, setLoading] = useState(false);

  const handleBoost = async () => {
    setLoading(true);
    try {
      const pkg = BOOST_PACKAGES.find(p => p.id === selectedPackage);
      if (!pkg) throw new Error('Invalid package selected');

      console.log('Creating boost payment for listing:', listingId, 'package:', pkg);

      const { data, error } = await supabase.functions.invoke('create-boost-payment', {
        body: {
          listing_id: listingId,
          duration_hours: pkg.duration,
          price_id: pkg.priceId,
        },
      });

      console.log('Boost payment response:', { data, error });

      if (error) {
        console.error('Error from edge function:', error);
        throw new Error(error.message || 'Failed to create payment session');
      }

      // Check if data exists and has url
      if (!data) {
        console.error('No data received from edge function');
        throw new Error('No response received from payment service');
      }

      console.log('Payment data received:', data);

      // The url might be directly in data or in data.url depending on the response structure
      const paymentUrl = data.url || data;
      
      if (!paymentUrl || typeof paymentUrl !== 'string') {
        console.error('Invalid payment URL:', paymentUrl);
        throw new Error('Invalid payment URL received');
      }

      console.log('Redirecting to Stripe payment URL:', paymentUrl);
      
      toast.loading('Opening payment page...', { duration: 2000 });
      
      // Small delay to ensure toast is visible, then redirect
      setTimeout(() => {
        window.location.href = paymentUrl;
      }, 300);
      
    } catch (error: any) {
      console.error('Error creating boost payment:', error);
      toast.error(error.message || 'Failed to create payment. Please try again.');
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Rocket className="h-5 w-5 text-primary" />
            Boost Your Listing
          </DialogTitle>
          <DialogDescription>
            Get your listing "{listingTitle}" to the top of search results
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <RadioGroup value={selectedPackage} onValueChange={setSelectedPackage}>
            {BOOST_PACKAGES.map((pkg) => (
              <div key={pkg.id} className="relative">
                <Label
                  htmlFor={pkg.id}
                  className={`flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                    selectedPackage === pkg.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <RadioGroupItem value={pkg.id} id={pkg.id} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{pkg.name}</span>
                        {pkg.popular && (
                          <span className="px-2 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">
                            Popular
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <Clock className="h-3 w-3" />
                        {pkg.description}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">€{pkg.price}</div>
                  </div>
                </Label>
              </div>
            ))}
          </RadioGroup>

          <div className="bg-muted p-4 rounded-lg space-y-2">
            <h4 className="font-semibold">What you get:</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>✓ Top placement in search results</li>
              <li>✓ Priority display on homepage</li>
              <li>✓ Highlighted listing badge</li>
              <li>✓ Increased visibility to potential renters</li>
            </ul>
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleBoost} disabled={loading} className="flex-1">
            {loading ? 'Processing...' : 'Continue to Payment'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
