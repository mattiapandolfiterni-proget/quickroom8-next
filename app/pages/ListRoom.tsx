import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Header } from '@/components/Header';
import SEO from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Loader2, Home, Plus, Trash2, Users } from 'lucide-react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { ImageUpload } from '@/components/ImageUpload';
import { useImageUpload } from '@/hooks/useImageUpload';
import { z } from 'zod';
import { NEW_LISTING_DEFAULTS, logApprovalAction } from '@/lib/approval';

const listingSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(200, 'Title too long'),
  description: z.string().max(5000, 'Description too long').optional(),
  location: z.string().min(3, 'Location is required').max(200, 'Location too long'),
  address: z.string().max(300, 'Address too long').optional(),
  price: z.number().min(1, 'Price must be at least 1').max(100000, 'Price too high'),
  room_size: z.number().min(1, 'Room size must be positive').max(1000, 'Room size too large').optional(),
  total_bedrooms: z.number().min(1).max(50).optional(),
  total_bathrooms: z.number().min(1).max(50).optional(),
  floor_level: z.number().min(-5).max(200).optional(),
});

interface Flatmate {
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  nationality: string;
  occupation: string;
  traits: string[];
}

const ListRoom = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(!!editId);
  const [roomType, setRoomType] = useState<string>('');
  const [contractType, setContractType] = useState<string>('');
  const [flatmates, setFlatmates] = useState<Flatmate[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const { uploadMultipleImages, uploading } = useImageUpload();
  const [currentFlatmate, setCurrentFlatmate] = useState<Partial<Flatmate>>({
    traits: []
  });

  useEffect(() => {
    if (editId && user) {
      loadListingData();
    }
  }, [editId, user]);

  const loadListingData = async () => {
    if (!editId) return;
    
    try {
      const { data, error } = await supabase
        .from('room_listings')
        .select(`
          *,
          flatmates (id, name, age, gender, nationality, occupation, traits, avatar_url)
        `)
        .eq('id', editId)
        .eq('owner_id', user!.id)
        .single();

      if (error) throw error;
      
      if (data) {
        // Pre-populate form fields
        setRoomType(data.room_type);
        setContractType(data.contract_type);
        setImages(data.images || []);
        setFlatmates(data.flatmates || []);
        
        // Set form values using setTimeout to ensure DOM is ready
        setTimeout(() => {
          const form = document.querySelector('form') as HTMLFormElement;
          if (form) {
            (form.elements.namedItem('title') as HTMLInputElement).value = data.title;
            (form.elements.namedItem('description') as HTMLTextAreaElement).value = data.description || '';
            (form.elements.namedItem('location') as HTMLInputElement).value = data.location;
            (form.elements.namedItem('address') as HTMLInputElement).value = data.address || '';
            (form.elements.namedItem('price') as HTMLInputElement).value = data.price.toString();
            (form.elements.namedItem('available_from') as HTMLInputElement).value = data.available_from || '';
            (form.elements.namedItem('available_until') as HTMLInputElement).value = data.available_until || '';
            (form.elements.namedItem('room_size') as HTMLInputElement).value = data.room_size?.toString() || '';
            (form.elements.namedItem('bedrooms') as HTMLInputElement).value = data.total_bedrooms?.toString() || '';
            (form.elements.namedItem('bathrooms') as HTMLInputElement).value = data.total_bathrooms?.toString() || '';
            (form.elements.namedItem('floor_level') as HTMLInputElement).value = data.floor_level?.toString() || '';
            
            // Set checkboxes
            (form.elements.namedItem('furnished') as HTMLInputElement).checked = data.is_furnished || false;
            (form.elements.namedItem('private_bathroom') as HTMLInputElement).checked = data.has_private_bathroom || false;
            (form.elements.namedItem('balcony') as HTMLInputElement).checked = data.has_balcony || false;
            (form.elements.namedItem('window') as HTMLInputElement).checked = data.has_window || false;
            (form.elements.namedItem('living_room') as HTMLInputElement).checked = data.has_living_room || false;
            (form.elements.namedItem('shared_kitchen') as HTMLInputElement).checked = data.has_shared_kitchen || false;
            (form.elements.namedItem('lift') as HTMLInputElement).checked = data.has_lift || false;
            (form.elements.namedItem('wifi') as HTMLInputElement).checked = data.has_wifi || false;
            (form.elements.namedItem('ac') as HTMLInputElement).checked = data.has_ac || false;
            (form.elements.namedItem('heating') as HTMLInputElement).checked = data.has_heating || false;
            (form.elements.namedItem('parking') as HTMLInputElement).checked = data.has_parking || false;
            (form.elements.namedItem('pets') as HTMLInputElement).checked = data.is_pet_friendly || false;
            (form.elements.namedItem('bills') as HTMLInputElement).checked = data.bills_included || false;
          }
        }, 100);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
      navigate('/my-listings');
    } finally {
      setInitialLoading(false);
    }
  };

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-background">
        <SEO 
          title="List Your Room in Malta"
          description="List your room for rent in Malta. Reach thousands of potential tenants and flatmates. Easy listing process with photo uploads and detailed room information."
          keywords="list room Malta, rent room Malta, advertise room Malta, find tenant Malta, room listing Malta"
          url="https://www.quickroom8.com/list-room"
        />
        <Header />
        <div className="container py-12 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading listing...</p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    
    // Validate form data
    const validationData = {
      title: formData.get('title') as string,
      description: (formData.get('description') as string) || undefined,
      location: formData.get('location') as string,
      address: (formData.get('address') as string) || undefined,
      price: parseFloat(formData.get('price') as string),
      room_size: formData.get('room_size') ? parseFloat(formData.get('room_size') as string) : undefined,
      total_bedrooms: formData.get('bedrooms') ? parseInt(formData.get('bedrooms') as string) : undefined,
      total_bathrooms: formData.get('bathrooms') ? parseInt(formData.get('bathrooms') as string) : undefined,
      floor_level: formData.get('floor_level') ? parseInt(formData.get('floor_level') as string) : undefined,
    };

    const result = listingSchema.safeParse(validationData);
    if (!result.success) {
      toast({
        title: "Validation Error",
        description: result.error.issues[0].message,
        variant: "destructive",
      });
      setLoading(false);
      return;
    }
    
    if (images.length === 0) {
      toast({
        title: 'Images Required',
        description: 'Please upload at least one image',
        variant: 'destructive',
      });
      setLoading(false);
      return;
    }

    if (!roomType || !contractType) {
      toast({
        title: 'Required Fields',
        description: 'Please select both room type and contract type',
        variant: 'destructive',
      });
      setLoading(false);
      return;
    }

    // Validate enum values
    const validRoomTypes = ['private', 'shared', 'ensuite'];
    const validContractTypes = ['short_term', 'long_term', 'flexible'];
    
    if (!validRoomTypes.includes(roomType)) {
      toast({
        title: 'Invalid Room Type',
        description: `Room type must be one of: ${validRoomTypes.join(', ')}`,
        variant: 'destructive',
      });
      setLoading(false);
      return;
    }
    
    if (!validContractTypes.includes(contractType)) {
      toast({
        title: 'Invalid Contract Type',
        description: `Contract type must be one of: ${validContractTypes.join(', ')}`,
        variant: 'destructive',
      });
      setLoading(false);
      return;
    }

    // Build amenities array from switches - read DOM elements directly
    const form = e.target as HTMLFormElement;
    const amenities: string[] = [];
    
    const wifiSwitch = form.querySelector('#wifi') as HTMLButtonElement;
    const acSwitch = form.querySelector('#ac') as HTMLButtonElement;
    const heatingSwitch = form.querySelector('#heating') as HTMLButtonElement;
    const furnishedSwitch = form.querySelector('#furnished') as HTMLButtonElement;
    const parkingSwitch = form.querySelector('#parking') as HTMLButtonElement;
    const petsSwitch = form.querySelector('#pets') as HTMLButtonElement;
    const billsSwitch = form.querySelector('#bills') as HTMLButtonElement;
    const balconySwitch = form.querySelector('#balcony') as HTMLButtonElement;
    const liftSwitch = form.querySelector('#lift') as HTMLButtonElement;
    const privateBathroomSwitch = form.querySelector('#private_bathroom') as HTMLButtonElement;
    const livingRoomSwitch = form.querySelector('#living_room') as HTMLButtonElement;
    const sharedKitchenSwitch = form.querySelector('#shared_kitchen') as HTMLButtonElement;

    if (wifiSwitch?.getAttribute('data-state') === 'checked') amenities.push('WiFi');
    if (acSwitch?.getAttribute('data-state') === 'checked') amenities.push('AC');
    if (heatingSwitch?.getAttribute('data-state') === 'checked') amenities.push('Heating');
    if (furnishedSwitch?.getAttribute('data-state') === 'checked') amenities.push('Furnished');
    if (parkingSwitch?.getAttribute('data-state') === 'checked') amenities.push('Parking');
    if (petsSwitch?.getAttribute('data-state') === 'checked') amenities.push('Pet Friendly');
    if (billsSwitch?.getAttribute('data-state') === 'checked') amenities.push('Bills Included');
    if (balconySwitch?.getAttribute('data-state') === 'checked') amenities.push('Balcony');
    if (liftSwitch?.getAttribute('data-state') === 'checked') amenities.push('Lift');
    if (privateBathroomSwitch?.getAttribute('data-state') === 'checked') amenities.push('Private Bathroom');
    if (livingRoomSwitch?.getAttribute('data-state') === 'checked') amenities.push('Living Room');
    if (sharedKitchenSwitch?.getAttribute('data-state') === 'checked') amenities.push('Shared Kitchen');

    const listing = {
      owner_id: user.id,
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      location: formData.get('location') as string,
      address: formData.get('address') as string,
      price: parseInt(formData.get('price') as string),
      room_type: roomType.trim() as 'private' | 'shared' | 'ensuite',
      contract_type: contractType.trim() as 'short_term' | 'long_term' | 'flexible',
      available_from: formData.get('available_from') as string,
      available_until: formData.get('available_until') as string || null,
      room_size: formData.get('room_size') ? parseInt(formData.get('room_size') as string) : null,
      total_bedrooms: parseInt(formData.get('bedrooms') as string),
      total_bathrooms: parseInt(formData.get('bathrooms') as string),
      floor_level: formData.get('floor_level') ? parseInt(formData.get('floor_level') as string) : null,
      is_furnished: formData.get('furnished') === 'on',
      has_private_bathroom: formData.get('private_bathroom') === 'on',
      has_balcony: formData.get('balcony') === 'on',
      has_window: formData.get('window') === 'on',
      has_living_room: formData.get('living_room') === 'on',
      has_shared_kitchen: formData.get('shared_kitchen') === 'on',
      has_lift: formData.get('lift') === 'on',
      has_wifi: formData.get('wifi') === 'on',
      has_ac: formData.get('ac') === 'on',
      has_heating: formData.get('heating') === 'on',
      has_parking: formData.get('parking') === 'on',
      is_pet_friendly: formData.get('pets') === 'on',
      bills_included: formData.get('bills') === 'on',
      amenities,
      images,
      // APPROVAL WORKFLOW: New listings ALWAYS start as pending
      // They must be approved by admin before becoming publicly visible
      ...NEW_LISTING_DEFAULTS,
    };

    try {
      if (editId) {
        // Update existing listing - reset to pending approval
        // APPROVAL WORKFLOW: Edited listings must be re-approved by admin
        const { error: listingError } = await supabase
          .from('room_listings')
          .update({
            ...listing,
            ...NEW_LISTING_DEFAULTS, // Reset to pending state
          })
          .eq('id', editId)
          .eq('owner_id', user.id);
        
        logApprovalAction('create', 'listing', editId, user.id);

        if (listingError) throw listingError;

        // Geocode address to get coordinates
        if (listing.address) {
          try {
            await supabase.functions.invoke('geocode-address', {
              body: { 
                address: listing.address,
                listingId: editId 
              }
            });
          } catch {
            // Non-blocking error - listing still saved
          }
        }

        // Notify all admins about the edited listing
        const { data: adminRoles, error: adminError } = await supabase
          .from('user_roles')
          .select('user_id')
          .eq('role', 'admin');

        if (adminRoles && adminRoles.length > 0) {
          const notifications = adminRoles.map(admin => ({
            user_id: admin.user_id,
            title: 'Edited Listing Pending Review',
            content: `The listing "${listing.title}" has been edited and requires your review.`,
            type: 'listing',
            link: '/admin?tab=listings'
          }));

          await supabase.from('notifications').insert(notifications);
        }

        // Delete old flatmates and insert new ones
        await supabase
          .from('flatmates')
          .delete()
          .eq('listing_id', editId);

        if (flatmates.length > 0) {
          const flatmatesData = flatmates.map(flatmate => ({
            listing_id: editId,
            name: flatmate.name,
            age: flatmate.age,
            gender: flatmate.gender,
            nationality: flatmate.nationality,
            occupation: flatmate.occupation,
            traits: flatmate.traits,
          }));

          const { error: flatmatesError } = await supabase
            .from('flatmates')
            .insert(flatmatesData);

          if (flatmatesError) throw flatmatesError;
        }

        toast({
          title: "Success!",
          description: "Your listing has been updated and is pending admin approval.",
        });
      } else {
        // Create new listing
        const { data: listingData, error: listingError } = await supabase
          .from('room_listings')
          .insert([listing])
          .select()
          .single();

        if (listingError) throw listingError;

        // Geocode address to get coordinates
        if (listingData && listing.address) {
          try {
            await supabase.functions.invoke('geocode-address', {
              body: { 
                address: listing.address,
                listingId: listingData.id 
              }
            });
          } catch {
            // Non-blocking error - listing still saved
          }
        }

        // Notify all admins about the new listing pending approval
        const { data: adminRoles, error: adminError } = await supabase
          .from('user_roles')
          .select('user_id')
          .eq('role', 'admin');

        if (adminRoles && adminRoles.length > 0) {
          const notifications = adminRoles.map(admin => ({
            user_id: admin.user_id,
            title: 'New Listing Pending Approval',
            content: `A new room listing "${listing.title}" has been submitted and requires your review.`,
            type: 'listing',
            link: '/admin?tab=listings'
          }));

          await supabase.from('notifications').insert(notifications);
        }

        // Insert flatmates if any
        if (flatmates.length > 0 && listingData) {
          const flatmatesData = flatmates.map(flatmate => ({
            listing_id: listingData.id,
            name: flatmate.name,
            age: flatmate.age,
            gender: flatmate.gender,
            nationality: flatmate.nationality,
            occupation: flatmate.occupation,
            traits: flatmate.traits,
          }));

          const { error: flatmatesError } = await supabase
            .from('flatmates')
            .insert(flatmatesData);

          if (flatmatesError) throw flatmatesError;
        }

        toast({
          title: "Success!",
          description: "Your listing has been submitted and is pending admin approval.",
        });
      }
      
      navigate('/my-listings');
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

  const handleImageUpload = async (files: FileList) => {
    const urls = await uploadMultipleImages(Array.from(files), 'room-images', user.id);
    if (urls.length > 0) {
      setImages([...images, ...urls]);
    }
  };

  const addFlatmate = () => {
    if (currentFlatmate.name && currentFlatmate.age && currentFlatmate.gender && 
        currentFlatmate.nationality && currentFlatmate.occupation) {
      setFlatmates([...flatmates, currentFlatmate as Flatmate]);
      setCurrentFlatmate({ traits: [] });
    } else {
      toast({
        title: "Missing Information",
        description: "Please fill all flatmate details",
        variant: "destructive",
      });
    }
  };

  const removeFlatmate = (index: number) => {
    setFlatmates(flatmates.filter((_, i) => i !== index));
  };

  const addTrait = (trait: string) => {
    if (trait.trim()) {
      setCurrentFlatmate({
        ...currentFlatmate,
        traits: [...(currentFlatmate.traits || []), trait.trim()]
      });
    }
  };

  const removeTrait = (index: number) => {
    setCurrentFlatmate({
      ...currentFlatmate,
      traits: currentFlatmate.traits?.filter((_, i) => i !== index) || []
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title={editId ? 'Edit Room Listing' : 'List Your Room in Malta'}
        description="List your room for rent in Malta. Reach thousands of potential tenants and flatmates. Easy listing process with photo uploads and detailed room information."
        keywords="list room Malta, rent room Malta, advertise room Malta, find tenant Malta, room listing Malta, post room ad Malta"
        url="https://www.quickroom8.com/list-room"
      />
      <Header />
      <div className="container py-8 max-w-3xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Home className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-display font-bold">
              {editId ? 'Edit Room Listing' : 'List Your Room'}
            </h1>
            <p className="text-muted-foreground">
              {editId ? 'Update your room listing details' : 'Create a new room listing'}
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Room Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Listing Title</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="Modern room in central location"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Describe your room and flat..."
                  rows={4}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Room Images</Label>
                <ImageUpload
                  images={images}
                  onImagesChange={setImages}
                  onUpload={handleImageUpload}
                  uploading={uploading}
                  maxImages={5}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    name="location"
                    placeholder="Sliema, Malta"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Full Address</Label>
                  <Input
                    id="address"
                    name="address"
                    placeholder="123 Main Street"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Monthly Rent (€)</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    placeholder="600"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="room_size">Room Size (m²)</Label>
                  <Input
                    id="room_size"
                    name="room_size"
                    type="number"
                    placeholder="20"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="available_from">Available From</Label>
                  <Input
                    id="available_from"
                    name="available_from"
                    type="date"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="available_until">Available Until (Optional)</Label>
                  <Input
                    id="available_until"
                    name="available_until"
                    type="date"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="room_type">Room Type</Label>
                  <Select value={roomType} onValueChange={setRoomType} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="private">Private Room</SelectItem>
                      <SelectItem value="shared">Shared Room</SelectItem>
                      <SelectItem value="ensuite">Ensuite Room</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contract_type">Contract Type</Label>
                  <Select value={contractType} onValueChange={setContractType} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="short_term">Short Term</SelectItem>
                      <SelectItem value="long_term">Long Term</SelectItem>
                      <SelectItem value="flexible">Flexible</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bedrooms">Total Bedrooms</Label>
                  <Input
                    id="bedrooms"
                    name="bedrooms"
                    type="number"
                    min="1"
                    defaultValue="1"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bathrooms">Total Bathrooms</Label>
                  <Input
                    id="bathrooms"
                    name="bathrooms"
                    type="number"
                    min="1"
                    defaultValue="1"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="floor_level">Floor Level (Optional)</Label>
                <Input
                  id="floor_level"
                  name="floor_level"
                  type="number"
                  placeholder="3"
                />
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">Room Features</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="furnished">Furnished</Label>
                    <Switch id="furnished" name="furnished" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="private_bathroom">Private Bathroom</Label>
                    <Switch id="private_bathroom" name="private_bathroom" />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="balcony">Balcony</Label>
                    <Switch id="balcony" name="balcony" />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="window">Window</Label>
                    <Switch id="window" name="window" defaultChecked />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">Flat Features</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="living_room">Living Room</Label>
                    <Switch id="living_room" name="living_room" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="shared_kitchen">Shared Kitchen</Label>
                    <Switch id="shared_kitchen" name="shared_kitchen" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="lift">Lift/Elevator</Label>
                    <Switch id="lift" name="lift" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">Amenities & Utilities</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="wifi">WiFi</Label>
                    <Switch id="wifi" name="wifi" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="ac">Air Conditioning</Label>
                    <Switch id="ac" name="ac" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="heating">Heating</Label>
                    <Switch id="heating" name="heating" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="parking">Parking</Label>
                    <Switch id="parking" name="parking" />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="pets">Pet Friendly</Label>
                    <Switch id="pets" name="pets" />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="bills">Bills Included</Label>
                    <Switch id="bills" name="bills" />
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Listing
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              <CardTitle>Current Flatmates (Optional)</CardTitle>
            </div>
            <p className="text-sm text-muted-foreground">Add information about flatmates already living in the apartment</p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Display added flatmates */}
            {flatmates.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-semibold text-sm">Added Flatmates ({flatmates.length})</h4>
                {flatmates.map((flatmate, index) => (
                  <div key={index} className="p-4 bg-muted rounded-lg flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-semibold">{flatmate.name}, {flatmate.age}</p>
                      <p className="text-sm text-muted-foreground">{flatmate.nationality} • {flatmate.occupation}</p>
                      {flatmate.traits.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {flatmate.traits.map((trait, i) => (
                            <span key={i} className="text-xs px-2 py-1 bg-background rounded-full">
                              {trait}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFlatmate(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Add new flatmate form */}
            <div className="space-y-4 p-4 border rounded-lg">
              <h4 className="font-semibold">Add Flatmate</h4>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="flatmate_name">Name</Label>
                  <Input
                    id="flatmate_name"
                    value={currentFlatmate.name || ''}
                    onChange={(e) => setCurrentFlatmate({ ...currentFlatmate, name: e.target.value })}
                    placeholder="John Doe"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="flatmate_age">Age</Label>
                  <Input
                    id="flatmate_age"
                    type="number"
                    value={currentFlatmate.age || ''}
                    onChange={(e) => setCurrentFlatmate({ ...currentFlatmate, age: parseInt(e.target.value) })}
                    placeholder="25"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="flatmate_gender">Gender</Label>
                  <Select 
                    value={currentFlatmate.gender || ''} 
                    onValueChange={(value) => setCurrentFlatmate({ ...currentFlatmate, gender: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                      <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="flatmate_nationality">Nationality</Label>
                  <Input
                    id="flatmate_nationality"
                    value={currentFlatmate.nationality || ''}
                    onChange={(e) => setCurrentFlatmate({ ...currentFlatmate, nationality: e.target.value })}
                    placeholder="Italian"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="flatmate_occupation">Occupation</Label>
                <Input
                  id="flatmate_occupation"
                  value={currentFlatmate.occupation || ''}
                  onChange={(e) => setCurrentFlatmate({ ...currentFlatmate, occupation: e.target.value })}
                  placeholder="Software Engineer"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="flatmate_traits">Personality Traits</Label>
                <div className="flex gap-2">
                  <Input
                    id="flatmate_traits"
                    placeholder="e.g., Friendly, Clean, Quiet"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addTrait(e.currentTarget.value);
                        e.currentTarget.value = '';
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={(e) => {
                      const input = document.getElementById('flatmate_traits') as HTMLInputElement;
                      if (input.value) {
                        addTrait(input.value);
                        input.value = '';
                      }
                    }}
                  >
                    Add
                  </Button>
                </div>
                {currentFlatmate.traits && currentFlatmate.traits.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {currentFlatmate.traits.map((trait, i) => (
                      <span key={i} className="text-xs px-3 py-1 bg-primary/10 text-primary rounded-full flex items-center gap-1">
                        {trait}
                        <button
                          type="button"
                          onClick={() => removeTrait(i)}
                          className="hover:text-destructive"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <Button
                type="button"
                variant="secondary"
                onClick={addFlatmate}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Flatmate
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ListRoom;
