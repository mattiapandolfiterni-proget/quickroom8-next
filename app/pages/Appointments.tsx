import { useEffect, useState, useCallback } from 'react';
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
import { requireAppointmentAccess, logSecurityEvent } from '@/lib/security';

interface Appointment {
  id: string;
  appointment_date: string;
  notes: string | null;
  status: string | null;
  created_at: string | null;
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

  const fetchAppointments = useCallback(async () => {
    if (!user) return;

    setLoading(true);

    try {
      // Fetch appointments where user is owner (received requests)
      const { data: received, error: receivedError } = await supabase
        .from('viewing_appointments')
        .select('*')
        .eq('owner_id', user.id)
        .order('appointment_date', { ascending: true });

      if (receivedError) {
        console.error('Error fetching received appointments:', receivedError);
        toast.error('Failed to load received appointments');
      }

      // Fetch appointments where user is requester (sent requests)
      const { data: requested, error: requestedError } = await supabase
        .from('viewing_appointments')
        .select('*')
        .eq('requester_id', user.id)
        .order('appointment_date', { ascending: true });

      if (requestedError) {
        console.error('Error fetching requested appointments:', requestedError);
        toast.error('Failed to load requested appointments');
      }

      // Enrich received appointments with listing and requester info
      const enrichedReceived = await Promise.all(
        (received || []).map(async (appointment) => {
          // Get listing info
          const { data: listing } = await supabase
            .from('room_listings')
            .select('id, title, location')
            .eq('id', appointment.listing_id)
            .single();

          // Get requester profile
          const { data: requester } = await supabase
            .from('profiles')
            .select('full_name, email')
            .eq('id', appointment.requester_id)
            .single();

          return {
            ...appointment,
            listing: listing || { id: appointment.listing_id, title: 'Unknown Listing', location: 'Unknown' },
            requester: requester || { full_name: 'Unknown User', email: '' },
            owner: { full_name: '', email: '' }
          };
        })
      );

      // Enrich requested appointments with listing and owner info
      const enrichedRequested = await Promise.all(
        (requested || []).map(async (appointment) => {
          // Get listing info
          const { data: listing } = await supabase
            .from('room_listings')
            .select('id, title, location')
            .eq('id', appointment.listing_id)
            .single();

          // Get owner profile
          const { data: owner } = await supabase
            .from('profiles')
            .select('full_name, email')
            .eq('id', appointment.owner_id)
            .single();

          return {
            ...appointment,
            listing: listing || { id: appointment.listing_id, title: 'Unknown Listing', location: 'Unknown' },
            owner: owner || { full_name: 'Unknown User', email: '' },
            requester: { full_name: '', email: '' }
          };
        })
      );

      setReceivedAppointments(enrichedReceived as Appointment[]);
      setRequestedAppointments(enrichedRequested as Appointment[]);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchAppointments();
    }
  }, [user, fetchAppointments]);

  const updateAppointmentStatus = async (appointmentId: string, status: string) => {
    console.log('[Appointments] Updating status:', appointmentId, 'to', status);
    
    try {
      // SECURITY: Verify user has access to this appointment
      // Business rules:
      // - Owner can: confirm, cancel, complete
      // - Requester can: cancel only
      let accessInfo: { isOwner: boolean; isRequester: boolean };
      try {
        accessInfo = await requireAppointmentAccess(user!, appointmentId);
      } catch (securityError) {
        logSecurityEvent('APPOINTMENT_UPDATE_UNAUTHORIZED', user!.id, { appointmentId, attemptedStatus: status });
        toast.error('You do not have permission to update this appointment');
        return;
      }

      // SECURITY: Enforce business rules - requesters can only cancel
      if (accessInfo.isRequester && !accessInfo.isOwner && status !== 'cancelled') {
        logSecurityEvent('APPOINTMENT_UPDATE_FORBIDDEN', user!.id, { 
          appointmentId, 
          attemptedStatus: status, 
          reason: 'Requester can only cancel' 
        });
        toast.error('You can only cancel appointments you requested');
        return;
      }

      // Build the filter based on role for defense in depth
      let query = supabase
        .from('viewing_appointments')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', appointmentId);
      
      // Add ownership check to query
      if (accessInfo.isOwner) {
        query = query.eq('owner_id', user!.id);
      } else {
        query = query.eq('requester_id', user!.id);
      }

      const { data, error } = await query.select('*').single();

      if (error) {
        console.error('[Appointments] Update error:', error);
        toast.error(error.message || 'Failed to update appointment');
        return;
      }

      // CRITICAL: Verify update was persisted
      if (!data || data.status !== status) {
        console.error('[Appointments] Update verification failed. Expected:', status, 'Got:', data?.status);
        toast.error('Appointment update may not have been saved. Please refresh.');
        return;
      }

      console.log('[Appointments] Status updated successfully:', data.id, data.status);
      toast.success(`Appointment ${status}`);
      fetchAppointments();
    } catch (error: any) {
      const errorMessage = error?.message || error?.toString?.() || 'Failed to update appointment';
      console.error('[Appointments] Update exception:', errorMessage, error);
      toast.error(errorMessage);
    }
  };

  const getStatusBadge = (status: string | null | undefined) => {
    const normalizedStatus = status || 'pending';
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      pending: 'default',
      confirmed: 'secondary',
      cancelled: 'destructive',
      completed: 'outline',
    };
    return <Badge variant={variants[normalizedStatus] || 'default'}>{normalizedStatus}</Badge>;
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
            <span>{isOwner ? (appointment.requester?.full_name || 'Unknown User') : (appointment.owner?.full_name || 'Unknown User')}</span>
          </div>
        </div>

        {appointment.notes && (
          <div className="p-3 bg-muted rounded-md">
            <p className="text-sm">{appointment.notes}</p>
          </div>
        )}

        {(appointment.status === 'pending' || !appointment.status) && isOwner && (
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
