import { useEffect, useState } from 'react';
import { Header } from '@/components/Header';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { Calendar, Clock, MapPin, User } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface Appointment {
  id: string;
  appointment_date: string;
  notes: string | null;
  status: string;
  created_at: string;
  listing: {
    id: string;
    title: string;
    location: string;
  };
  requester: {
    full_name: string;
    email: string;
  };
  owner: {
    full_name: string;
    email: string;
  };
}

export default function Appointments() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [receivedAppointments, setReceivedAppointments] = useState<Appointment[]>([]);
  const [requestedAppointments, setRequestedAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAppointments();
    }
  }, [user]);

  const fetchAppointments = async () => {
    if (!user) return;

    setLoading(true);

    // Fetch appointments where user is owner
    const { data: received } = await supabase
      .from('viewing_appointments')
      .select(`
        *,
        listing:room_listings!viewing_appointments_listing_id_fkey(id, title, location),
        requester:profiles!viewing_appointments_requester_id_fkey(full_name, email)
      `)
      .eq('owner_id', user.id)
      .order('appointment_date', { ascending: true });

    // Fetch appointments where user is requester
    const { data: requested } = await supabase
      .from('viewing_appointments')
      .select(`
        *,
        listing:room_listings!viewing_appointments_listing_id_fkey(id, title, location),
        owner:profiles!viewing_appointments_owner_id_fkey(full_name, email)
      `)
      .eq('requester_id', user.id)
      .order('appointment_date', { ascending: true });

    if (received) setReceivedAppointments(received as any);
    if (requested) setRequestedAppointments(requested as any);
    setLoading(false);
  };

  const updateAppointmentStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from('viewing_appointments')
      .update({ status })
      .eq('id', id);

    if (error) {
      toast.error('Failed to update appointment');
    } else {
      toast.success(`Appointment ${status}`);
      fetchAppointments();
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      pending: 'default',
      confirmed: 'secondary',
      cancelled: 'destructive',
      completed: 'outline',
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  const AppointmentCard = ({ appointment, isOwner }: { appointment: Appointment; isOwner: boolean }) => (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle 
              className="text-lg cursor-pointer hover:text-primary"
              onClick={() => navigate(`/room/${appointment.listing.id}`)}
            >
              {appointment.listing.title}
            </CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4" />
              {appointment.listing.location}
            </div>
          </div>
          {getStatusBadge(appointment.status)}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4" />
            <span>{format(new Date(appointment.appointment_date), 'MMM d, yyyy')}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4" />
            <span>{format(new Date(appointment.appointment_date), 'HH:mm')}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <User className="w-4 h-4" />
            <span>{isOwner ? appointment.requester.full_name : appointment.owner.full_name}</span>
          </div>
        </div>

        {appointment.notes && (
          <div className="p-3 bg-muted rounded-md">
            <p className="text-sm">{appointment.notes}</p>
          </div>
        )}

        {appointment.status === 'pending' && isOwner && (
          <div className="flex gap-2">
            <Button
              onClick={() => updateAppointmentStatus(appointment.id, 'confirmed')}
              className="flex-1"
            >
              Confirm
            </Button>
            <Button
              onClick={() => updateAppointmentStatus(appointment.id, 'cancelled')}
              variant="destructive"
              className="flex-1"
            >
              Decline
            </Button>
          </div>
        )}

        {appointment.status === 'confirmed' && (
          <Button
            onClick={() => updateAppointmentStatus(appointment.id, 'completed')}
            variant="outline"
            className="w-full"
          >
            Mark as Completed
          </Button>
        )}
      </CardContent>
    </Card>
  );

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <p>Please log in to view appointments.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">My Appointments</h1>

        <Tabs defaultValue="received" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="received">
              Received ({receivedAppointments.length})
            </TabsTrigger>
            <TabsTrigger value="requested">
              Requested ({requestedAppointments.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="received" className="space-y-4">
            {loading ? (
              <p>Loading...</p>
            ) : receivedAppointments.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No appointment requests received yet
                </CardContent>
              </Card>
            ) : (
              receivedAppointments.map((appointment) => (
                <AppointmentCard key={appointment.id} appointment={appointment} isOwner={true} />
              ))
            )}
          </TabsContent>

          <TabsContent value="requested" className="space-y-4">
            {loading ? (
              <p>Loading...</p>
            ) : requestedAppointments.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No appointment requests made yet
                </CardContent>
              </Card>
            ) : (
              requestedAppointments.map((appointment) => (
                <AppointmentCard key={appointment.id} appointment={appointment} isOwner={false} />
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
