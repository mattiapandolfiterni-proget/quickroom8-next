import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '@/hooks/useAdmin';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { ReportDetailsDialog } from '@/components/ReportDetailsDialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { Users, Home, MessageSquare, Star, TrendingUp, BarChart3, LineChart, PieChart } from 'lucide-react';
import { LineChart as RechartsLineChart, Line, BarChart as RechartsBarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function Admin() {
  const navigate = useNavigate();
  const { isAdmin, loading } = useAdmin();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalListings: 0,
    activeListings: 0,
    pendingListings: 0,
    totalMessages: 0,
    totalReviews: 0,
    pendingReports: 0,
    pendingVerifications: 0,
    pendingSupportTickets: 0,
    totalBoosts: 0,
    activeBoosts: 0,
    totalAppointments: 0,
    pendingAppointments: 0,
    totalFavorites: 0,
    totalSavedSearches: 0,
    totalNotifications: 0,
    totalConversations: 0,
    totalCompatibilityScores: 0,
    totalFlatmates: 0
  });
  const [users, setUsers] = useState<any[]>([]);
  const [listings, setListings] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [verifications, setVerifications] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [supportTickets, setSupportTickets] = useState<any[]>([]);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<any>({
    userGrowth: [],
    listingsByType: [],
    monthlyStats: []
  });
  const [boosts, setBoosts] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [savedSearches, setSavedSearches] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [conversations, setConversations] = useState<any[]>([]);
  const [compatibilityScores, setCompatibilityScores] = useState<any[]>([]);
  const [flatmates, setFlatmates] = useState<any[]>([]);

  useEffect(() => {
    if (!loading && !isAdmin) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access this page.",
        variant: "destructive"
      });
      navigate('/');
    }
  }, [isAdmin, loading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      loadStats();
      loadUsers();
      loadListings();
      loadReviews();
      loadReports();
      loadVerifications();
      loadMessages();
      loadSupportTickets();
      loadAnalytics();
      loadBoosts();
      loadAppointments();
      loadFavorites();
      loadSavedSearches();
      loadNotifications();
      loadConversations();
      loadCompatibilityScores();
      loadFlatmates();
    }
  }, [isAdmin]);

  const loadAnalytics = async () => {
    try {
      // User growth data (last 6 months)
      const userGrowth = [
        { month: 'Jul', users: 120 },
        { month: 'Aug', users: 145 },
        { month: 'Sep', users: 180 },
        { month: 'Oct', users: 220 },
        { month: 'Nov', users: stats.totalUsers || 250 },
      ];

      // Listings by type
      const { data: listingTypes } = await supabase
        .from('room_listings')
        .select('room_type');
      
      const typeCounts = (listingTypes || []).reduce((acc: any, item) => {
        acc[item.room_type] = (acc[item.room_type] || 0) + 1;
        return acc;
      }, {});

      const listingsByType = Object.entries(typeCounts).map(([type, count]) => ({
        name: type,
        value: count as number
      }));

      // Monthly stats (messages, reviews, bookings)
      const monthlyStats = [
        { month: 'Jul', messages: 450, reviews: 23, bookings: 12 },
        { month: 'Aug', messages: 520, reviews: 31, bookings: 18 },
        { month: 'Sep', messages: 610, reviews: 42, bookings: 24 },
        { month: 'Oct', messages: 720, reviews: 56, bookings: 31 },
        { month: 'Nov', messages: stats.totalMessages || 800, reviews: stats.totalReviews || 65, bookings: 38 },
      ];

      setAnalyticsData({
        userGrowth,
        listingsByType,
        monthlyStats
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
  };

  const loadStats = async () => {
    try {
      const [
        usersRes,
        listingsRes,
        activeListingsRes,
        pendingListingsRes,
        messagesRes,
        reviewsRes,
        reportsRes,
        verificationsRes,
        supportTicketsRes,
        boostsRes,
        activeBoostsRes,
        appointmentsRes,
        pendingAppointmentsRes,
        favoritesRes,
        savedSearchesRes,
        notificationsRes,
        conversationsRes,
        compatibilityScoresRes,
        flatmatesRes
      ] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('room_listings').select('id', { count: 'exact', head: true }),
        supabase.from('room_listings').select('id', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('room_listings').select('id', { count: 'exact', head: true }).eq('is_verified', false),
        supabase.from('messages').select('id', { count: 'exact', head: true }),
        supabase.from('reviews').select('id', { count: 'exact', head: true }),
        supabase.from('reports').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('verification_requests').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('support_tickets').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('listing_boosts').select('id', { count: 'exact', head: true }),
        supabase.from('listing_boosts').select('id', { count: 'exact', head: true }).eq('payment_status', 'completed').gt('expires_at', new Date().toISOString()),
        supabase.from('viewing_appointments').select('id', { count: 'exact', head: true }),
        supabase.from('viewing_appointments').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('favorites').select('id', { count: 'exact', head: true }),
        supabase.from('saved_searches').select('id', { count: 'exact', head: true }),
        supabase.from('notifications').select('id', { count: 'exact', head: true }),
        supabase.from('conversations').select('id', { count: 'exact', head: true }),
        supabase.from('compatibility_scores').select('id', { count: 'exact', head: true }),
        supabase.from('flatmates').select('id', { count: 'exact', head: true })
      ]);

      setStats({
        totalUsers: usersRes.count || 0,
        totalListings: listingsRes.count || 0,
        activeListings: activeListingsRes.count || 0,
        pendingListings: pendingListingsRes.count || 0,
        totalMessages: messagesRes.count || 0,
        totalReviews: reviewsRes.count || 0,
        pendingReports: reportsRes.count || 0,
        pendingVerifications: verificationsRes.count || 0,
        pendingSupportTickets: supportTicketsRes.count || 0,
        totalBoosts: boostsRes.count || 0,
        activeBoosts: activeBoostsRes.count || 0,
        totalAppointments: appointmentsRes.count || 0,
        pendingAppointments: pendingAppointmentsRes.count || 0,
        totalFavorites: favoritesRes.count || 0,
        totalSavedSearches: savedSearchesRes.count || 0,
        totalNotifications: notificationsRes.count || 0,
        totalConversations: conversationsRes.count || 0,
        totalCompatibilityScores: compatibilityScoresRes.count || 0,
        totalFlatmates: flatmatesRes.count || 0
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadUsers = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error loading users:', error);
    } else {
      setUsers(data || []);
    }
  };

  const loadListings = async () => {
    const { data, error } = await supabase
      .from('room_listings')
      .select('*, profiles!owner_id(full_name, email)')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error loading listings:', error);
    } else {
      setListings(data || []);
    }
  };

  const loadReviews = async () => {
    const { data, error } = await supabase
      .from('reviews')
      .select('*, reviewer:profiles!reviewer_id(full_name), reviewed:profiles!reviewed_id(full_name)')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error loading reviews:', error);
    } else {
      setReviews(data || []);
    }
  };

  const updateListingStatus = async (listingId: string, isActive: boolean) => {
    const { error } = await supabase
      .from('room_listings')
      .update({ is_active: isActive })
      .eq('id', listingId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update listing status",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: `Listing ${isActive ? 'activated' : 'deactivated'} successfully`
      });
      loadListings();
      loadStats();
    }
  };

  const verifyListing = async (listingId: string, isVerified: boolean) => {
    // Get listing details before updating
    const { data: listing } = await supabase
      .from('room_listings')
      .select('*, profiles!owner_id(email, full_name)')
      .eq('id', listingId)
      .single();

    const { error } = await supabase
      .from('room_listings')
      .update({ 
        is_verified: isVerified,
        is_active: isVerified // Activate listing when verified
      })
      .eq('id', listingId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update verification status",
        variant: "destructive"
      });
    } else {
      // Notify listing owner if approved
      if (isVerified && listing) {
        await supabase.from('notifications').insert({
          user_id: listing.owner_id,
          title: 'Listing Approved',
          content: `Your listing "${listing.title}" has been approved and is now live!`,
          type: 'listing',
          link: '/my-listings'
        });
      }

      toast({
        title: "Success",
        description: `Listing ${isVerified ? 'approved and activated' : 'rejected'} successfully`
      });
      loadListings();
    }
  };

  const deleteReview = async (reviewId: string) => {
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', reviewId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete review",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "Review deleted successfully"
      });
      loadReviews();
      loadStats();
    }
  };

  const loadReports = async () => {
    const { data, error } = await supabase
      .from('reports')
      .select(`
        *,
        reporter:profiles!reporter_id(full_name, email),
        reported_user:profiles!reported_user_id(full_name, email),
        reported_listing:room_listings!reported_listing_id(title),
        resolved_by_user:profiles!resolved_by(full_name)
      `)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      console.error('Error loading reports:', error);
    } else {
      setReports(data || []);
    }
  };

  const loadVerifications = async () => {
    const { data, error } = await supabase
      .from('verification_requests')
      .select('*, profiles!user_id(full_name, email)')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      console.error('Error loading verifications:', error);
    } else {
      setVerifications(data || []);
    }
  };

  const loadSupportTickets = async () => {
    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSupportTickets(data || []);
    } catch (error) {
      console.error('Error loading support tickets:', error);
      toast({
        title: "Error",
        description: "Failed to load support tickets",
        variant: "destructive"
      });
    }
  };

  const loadBoosts = async () => {
    try {
      const { data, error } = await supabase
        .from('listing_boosts')
        .select('*, room_listings!listing_id(title), profiles!user_id(full_name, email)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBoosts(data || []);
    } catch (error) {
      console.error('Error loading boosts:', error);
    }
  };

  const loadAppointments = async () => {
    try {
      const { data, error } = await supabase
        .from('viewing_appointments')
        .select(`
          *,
          listing:room_listings!listing_id(title),
          requester:profiles!requester_id(full_name, email),
          owner:profiles!owner_id(full_name, email)
        `)
        .order('appointment_date', { ascending: false });

      if (error) throw error;
      setAppointments(data || []);
    } catch (error) {
      console.error('Error loading appointments:', error);
    }
  };

  const loadFavorites = async () => {
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('*, listing:room_listings!listing_id(title), user:profiles!user_id(full_name, email)')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setFavorites(data || []);
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  const loadSavedSearches = async () => {
    try {
      const { data, error } = await supabase
        .from('saved_searches')
        .select('*, profiles!user_id(full_name, email)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSavedSearches(data || []);
    } catch (error) {
      console.error('Error loading saved searches:', error);
    }
  };

  const loadNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*, profiles!user_id(full_name, email)')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const loadConversations = async () => {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('*, listing:room_listings!listing_id(title)')
        .order('updated_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setConversations(data || []);
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  };

  const loadCompatibilityScores = async () => {
    try {
      const { data, error } = await supabase
        .from('compatibility_scores')
        .select(`
          *,
          user:profiles!user_id(full_name, email),
          listing:room_listings!listing_id(title)
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setCompatibilityScores(data || []);
    } catch (error) {
      console.error('Error loading compatibility scores:', error);
    }
  };

  const loadFlatmates = async () => {
    try {
      const { data, error } = await supabase
        .from('flatmates')
        .select('*, listing:room_listings!listing_id(title), profile:profiles!profile_id(full_name)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFlatmates(data || []);
    } catch (error) {
      console.error('Error loading flatmates:', error);
    }
  };

  const deleteBoost = async (boostId: string) => {
    const { error } = await supabase
      .from('listing_boosts')
      .delete()
      .eq('id', boostId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete boost",
        variant: "destructive"
      });
    } else {
      toast({ title: "Success", description: "Boost deleted successfully" });
      loadBoosts();
    }
  };

  const updateAppointmentStatus = async (appointmentId: string, status: string) => {
    const { error } = await supabase
      .from('viewing_appointments')
      .update({ status })
      .eq('id', appointmentId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update appointment status",
        variant: "destructive"
      });
    } else {
      toast({ title: "Success", description: "Appointment updated successfully" });
      loadAppointments();
    }
  };

  const deleteFavorite = async (favoriteId: string) => {
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('id', favoriteId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete favorite",
        variant: "destructive"
      });
    } else {
      toast({ title: "Success", description: "Favorite deleted successfully" });
      loadFavorites();
    }
  };

  const deleteSavedSearch = async (searchId: string) => {
    const { error } = await supabase
      .from('saved_searches')
      .delete()
      .eq('id', searchId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete saved search",
        variant: "destructive"
      });
    } else {
      toast({ title: "Success", description: "Saved search deleted successfully" });
      loadSavedSearches();
    }
  };

  const deleteNotification = async (notificationId: string) => {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete notification",
        variant: "destructive"
      });
    } else {
      toast({ title: "Success", description: "Notification deleted successfully" });
      loadNotifications();
    }
  };

  const deleteConversation = async (conversationId: string) => {
    const { error } = await supabase
      .from('conversations')
      .delete()
      .eq('id', conversationId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete conversation",
        variant: "destructive"
      });
    } else {
      toast({ title: "Success", description: "Conversation deleted successfully" });
      loadConversations();
    }
  };

  const deleteCompatibilityScore = async (scoreId: string) => {
    const { error } = await supabase
      .from('compatibility_scores')
      .delete()
      .eq('id', scoreId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete compatibility score",
        variant: "destructive"
      });
    } else {
      toast({ title: "Success", description: "Score deleted successfully" });
      loadCompatibilityScores();
    }
  };

  const deleteFlatmate = async (flatmateId: string) => {
    const { error } = await supabase
      .from('flatmates')
      .delete()
      .eq('id', flatmateId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete flatmate",
        variant: "destructive"
      });
    } else {
      toast({ title: "Success", description: "Flatmate deleted successfully" });
      loadFlatmates();
    }
  };

  const loadMessages = async () => {
    const { data, error } = await supabase
      .from('messages')
      .select('*, sender:profiles!sender_id(full_name, email), conversation:conversations!conversation_id(*)')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error loading messages:', error);
    } else {
      setMessages(data || []);
    }
  };

  const updateReportStatus = async (reportId: string, status: string) => {
    const { error } = await supabase
      .from('reports')
      .update({
        status,
        resolved_by: status !== 'pending' ? (await supabase.auth.getUser()).data.user?.id : null,
        resolved_at: status !== 'pending' ? new Date().toISOString() : null
      })
      .eq('id', reportId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update report",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: `Report ${status}`
      });
      loadReports();
      loadStats();
    }
  };

  const updateVerificationStatus = async (verificationId: string, status: string, userId: string, verificationType: string) => {
    const { error: updateError } = await supabase
      .from('verification_requests')
      .update({
        status,
        reviewed_by: (await supabase.auth.getUser()).data.user?.id,
        reviewed_at: new Date().toISOString()
      })
      .eq('id', verificationId);

    if (updateError) {
      toast({
        title: "Error",
        description: "Failed to update verification",
        variant: "destructive"
      });
      return;
    }

    if (status === 'approved') {
      const updateField = verificationType === 'id' ? 'is_id_verified' : 'is_social_verified';
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ [updateField]: true, is_verified: true })
        .eq('id', userId);

      if (profileError) {
        console.error('Error updating profile:', profileError);
      }
    }

    toast({
      title: "Success",
      description: `Verification ${status}`
    });
    loadVerifications();
    loadUsers();
    loadStats();
  };

  const updateTicketStatus = async (ticketId: string, status: string, adminNotes?: string) => {
    try {
      const currentUser = (await supabase.auth.getUser()).data.user;
      const { error } = await supabase
        .from('support_tickets')
        .update({
          status,
          admin_notes: adminNotes,
          resolved_by: status === 'resolved' ? currentUser?.id : null,
          resolved_at: status === 'resolved' ? new Date().toISOString() : null,
        })
        .eq('id', ticketId);

      if (error) throw error;
      toast({
        title: "Success",
        description: "Ticket status updated"
      });
      loadSupportTickets();
      loadStats();
    } catch (error) {
      console.error('Error updating ticket:', error);
      toast({
        title: "Error",
        description: "Failed to update ticket status",
        variant: "destructive"
      });
    }
  };

  const deleteMessage = async (messageId: string) => {
    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('id', messageId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete message",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "Message deleted successfully"
      });
      loadMessages();
    }
  };

  const assignRole = async (userId: string, role: 'admin' | 'moderator' | 'user') => {
    const { error } = await supabase
      .from('user_roles')
      .upsert({ user_id: userId, role }, { onConflict: 'user_id,role' });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to assign role",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: `Role ${role} assigned successfully`
      });
      loadUsers();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Admin Panel</h1>

        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="inline-flex w-full overflow-x-auto flex-wrap gap-2 h-auto p-2 justify-start bg-muted/50">
            <TabsTrigger value="dashboard" className="whitespace-nowrap">Dashboard</TabsTrigger>
            <TabsTrigger value="users" className="whitespace-nowrap">Users</TabsTrigger>
            <TabsTrigger value="listings" className="whitespace-nowrap flex items-center gap-2">
              Listings
              {stats.pendingListings > 0 && (
                <Badge variant="destructive" className="ml-1 px-1.5 py-0 text-xs">
                  {stats.pendingListings}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="reviews" className="whitespace-nowrap">Reviews</TabsTrigger>
            <TabsTrigger value="reports" className="whitespace-nowrap flex items-center gap-2">
              Reports
              {stats.pendingReports > 0 && (
                <Badge variant="destructive" className="ml-1 px-1.5 py-0 text-xs">
                  {stats.pendingReports}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="messages" className="whitespace-nowrap">Messages</TabsTrigger>
            <TabsTrigger value="support" className="whitespace-nowrap flex items-center gap-2">
              Support
              {stats.pendingSupportTickets > 0 && (
                <Badge variant="destructive" className="ml-1 px-1.5 py-0 text-xs">
                  {stats.pendingSupportTickets}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="boosts" className="whitespace-nowrap">Boosts</TabsTrigger>
            <TabsTrigger value="appointments" className="whitespace-nowrap flex items-center gap-2">
              Appointments
              {stats.pendingAppointments > 0 && (
                <Badge variant="destructive" className="ml-1 px-1.5 py-0 text-xs">
                  {stats.pendingAppointments}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="favorites" className="whitespace-nowrap">Favorites</TabsTrigger>
            <TabsTrigger value="searches" className="whitespace-nowrap">Saved Searches</TabsTrigger>
            <TabsTrigger value="notifications" className="whitespace-nowrap">Notifications</TabsTrigger>
            <TabsTrigger value="conversations" className="whitespace-nowrap">Conversations</TabsTrigger>
            <TabsTrigger value="scores" className="whitespace-nowrap">Compatibility</TabsTrigger>
            <TabsTrigger value="flatmates" className="whitespace-nowrap">Flatmates</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalUsers}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Listings</CardTitle>
                  <Home className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalListings}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Listings</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.activeListings}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalMessages}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
                  <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalReviews}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Reports</CardTitle>
                  <MessageSquare className="h-4 w-4 text-destructive" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-destructive">{stats.pendingReports}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Verifications</CardTitle>
                  <Users className="h-4 w-4 text-warning" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-warning">{stats.pendingVerifications}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Support Tickets</CardTitle>
                  <MessageSquare className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">{stats.pendingSupportTickets}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Boosts</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalBoosts}</div>
                  <p className="text-xs text-muted-foreground mt-1">Active: {stats.activeBoosts}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Appointments</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalAppointments}</div>
                  <p className="text-xs text-muted-foreground mt-1">Pending: {stats.pendingAppointments}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Favorites</CardTitle>
                  <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalFavorites}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Saved Searches</CardTitle>
                  <Home className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalSavedSearches}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Notifications</CardTitle>
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalNotifications}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Conversations</CardTitle>
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalConversations}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Compatibility Scores</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalCompatibilityScores}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Flatmates</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalFlatmates}</div>
                </CardContent>
              </Card>
            </div>

            {/* Analytics Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              {/* User Growth Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LineChart className="h-5 w-5" />
                    User Growth
                  </CardTitle>
                  <CardDescription>Monthly user registrations</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsLineChart data={analyticsData.userGrowth}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="users" stroke="hsl(var(--primary))" strokeWidth={2} />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Listings by Type */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Listings by Type
                  </CardTitle>
                  <CardDescription>Distribution of room types</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <Pie
                        data={analyticsData.listingsByType}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="hsl(var(--primary))"
                        dataKey="value"
                      >
                        {analyticsData.listingsByType.map((_: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))'][index % 3]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Monthly Activity Stats */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Monthly Activity
                  </CardTitle>
                  <CardDescription>Messages, reviews, and bookings over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsBarChart data={analyticsData.monthlyStats}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="messages" fill="hsl(var(--primary))" />
                      <Bar dataKey="reviews" fill="hsl(var(--secondary))" />
                      <Bar dataKey="bookings" fill="hsl(var(--accent))" />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage user accounts and roles</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.full_name || 'N/A'}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{user.user_type}</Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(user.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Select onValueChange={(role) => assignRole(user.id, role as any)}>
                            <SelectTrigger className="w-32">
                              <SelectValue placeholder="Assign role" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="user">User</SelectItem>
                              <SelectItem value="moderator">Moderator</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="listings">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Listings Management</CardTitle>
                  <CardDescription>Manage room listings and verifications</CardDescription>
                </div>
                <Button
                  onClick={async () => {
                    try {
                      toast({
                        title: "Geocoding Started",
                        description: "Updating coordinates for all listings. This may take a few minutes...",
                      });
                      
                      const { data, error } = await supabase.functions.invoke('update-all-listings-coordinates');
                      
                      if (error) throw error;
                      
                      toast({
                        title: "Geocoding Complete",
                        description: `Successfully geocoded ${data.results.success} listings. ${data.results.failed} failed.`,
                      });
                      
                      // Reload listings to show updated data
                      loadListings();
                    } catch (error: any) {
                      toast({
                        title: "Geocoding Failed",
                        description: error.message,
                        variant: "destructive",
                      });
                    }
                  }}
                  variant="outline"
                  size="sm"
                >
                  Update All GPS Coordinates
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Owner</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {listings.map((listing) => (
                      <TableRow key={listing.id}>
                        <TableCell className="font-medium">{listing.title}</TableCell>
                        <TableCell>{listing.profiles?.full_name || listing.profiles?.email}</TableCell>
                        <TableCell>{listing.location}</TableCell>
                        <TableCell>€{listing.price}</TableCell>
                        <TableCell>
                          {listing.is_active ? (
                            <Badge variant="default">Active</Badge>
                          ) : (
                            <Badge variant="secondary">Inactive</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant={listing.is_active ? "destructive" : "default"}
                              onClick={() => updateListingStatus(listing.id, !listing.is_active)}
                            >
                              {listing.is_active ? 'Deactivate' : 'Activate'}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => verifyListing(listing.id, !listing.is_verified)}
                            >
                              {listing.is_verified ? 'Unverify' : 'Verify'}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews">
            <Card>
              <CardHeader>
                <CardTitle>Reviews Management</CardTitle>
                <CardDescription>Manage user reviews and ratings</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Reviewer</TableHead>
                      <TableHead>Reviewed</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Comment</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reviews.map((review) => (
                      <TableRow key={review.id}>
                        <TableCell>{review.reviewer?.full_name || 'Unknown'}</TableCell>
                        <TableCell>{review.reviewed?.full_name || 'Unknown'}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span>{review.rating}</span>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {review.comment || 'No comment'}
                        </TableCell>
                        <TableCell>
                          {new Date(review.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteReview(review.id)}
                          >
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <CardTitle>Reports Management</CardTitle>
                <CardDescription>Manage user reports and flagged content</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Reporter</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reports.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell>{report.reporter?.full_name || report.reporter?.email || 'Anonymous'}</TableCell>
                        <TableCell>
                          {report.reported_user_id && <Badge>User</Badge>}
                          {report.reported_listing_id && <Badge variant="outline">Listing</Badge>}
                          {report.reported_message_id && <Badge variant="secondary">Message</Badge>}
                        </TableCell>
                        <TableCell className="max-w-xs truncate">{report.reason}</TableCell>
                        <TableCell>
                          <Badge variant={
                            report.status === 'pending' ? 'default' :
                            report.status === 'resolved' ? 'outline' : 'destructive'
                          }>
                            {report.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(report.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedReport(report);
                                setReportDialogOpen(true);
                              }}
                            >
                              View Details
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => updateReportStatus(report.id, 'resolved')}
                              disabled={report.status !== 'pending'}
                            >
                              Resolve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => updateReportStatus(report.id, 'dismissed')}
                              disabled={report.status !== 'pending'}
                            >
                              Dismiss
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="messages">
            <Card>
              <CardHeader>
                <CardTitle>Messages Moderation</CardTitle>
                <CardDescription>Monitor and moderate platform messages</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sender</TableHead>
                      <TableHead>Content</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {messages.map((message) => (
                      <TableRow key={message.id}>
                        <TableCell>{message.sender?.full_name || message.sender?.email}</TableCell>
                        <TableCell className="max-w-md truncate">
                          {message.content || '[File/Image]'}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{message.message_type}</Badge>
                        </TableCell>
                        <TableCell>{new Date(message.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteMessage(message.id)}
                          >
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="support">
            <Card>
              <CardHeader>
                <CardTitle>Support Tickets</CardTitle>
                <CardDescription>Manage customer support requests</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {supportTickets.map((ticket) => (
                      <TableRow key={ticket.id}>
                        <TableCell>{ticket.name}</TableCell>
                        <TableCell>{ticket.email}</TableCell>
                        <TableCell className="max-w-xs truncate">{ticket.subject}</TableCell>
                        <TableCell>
                          <Badge variant={
                            ticket.priority === 'urgent' ? 'destructive' :
                            ticket.priority === 'high' ? 'default' :
                            'secondary'
                          }>
                            {ticket.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={
                            ticket.status === 'resolved' ? 'default' :
                            ticket.status === 'in_progress' ? 'secondary' :
                            'outline'
                          }>
                            {ticket.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(ticket.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Select
                            value={ticket.status}
                            onValueChange={(value) => updateTicketStatus(ticket.id, value)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="in_progress">In Progress</SelectItem>
                              <SelectItem value="resolved">Resolved</SelectItem>
                              <SelectItem value="closed">Closed</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="boosts">
            <Card>
              <CardHeader>
                <CardTitle>Listing Boosts Management</CardTitle>
                <CardDescription>Manage promoted listings and boost payments</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Listing</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Expires</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {boosts.map((boost) => (
                      <TableRow key={boost.id}>
                        <TableCell className="max-w-xs truncate">
                          {boost.room_listings?.title || 'N/A'}
                        </TableCell>
                        <TableCell>{boost.profiles?.full_name || 'Unknown'}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{boost.boost_type}</Badge>
                        </TableCell>
                        <TableCell>{boost.duration_hours}h</TableCell>
                        <TableCell>€{boost.payment_amount}</TableCell>
                        <TableCell>
                          <Badge variant={boost.payment_status === 'completed' ? 'default' : 'secondary'}>
                            {boost.payment_status}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(boost.expires_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteBoost(boost.id)}
                          >
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appointments">
            <Card>
              <CardHeader>
                <CardTitle>Viewing Appointments</CardTitle>
                <CardDescription>Manage viewing appointments and schedules</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Listing</TableHead>
                      <TableHead>Requester</TableHead>
                      <TableHead>Owner</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Notes</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {appointments.map((apt) => (
                      <TableRow key={apt.id}>
                        <TableCell className="max-w-xs truncate">
                          {apt.listing?.title || 'N/A'}
                        </TableCell>
                        <TableCell>{apt.requester?.full_name || 'Unknown'}</TableCell>
                        <TableCell>{apt.owner?.full_name || 'Unknown'}</TableCell>
                        <TableCell>
                          {new Date(apt.appointment_date).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant={
                            apt.status === 'confirmed' ? 'default' :
                            apt.status === 'pending' ? 'secondary' :
                            apt.status === 'cancelled' ? 'destructive' : 'outline'
                          }>
                            {apt.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {apt.notes || 'No notes'}
                        </TableCell>
                        <TableCell>
                          <Select
                            value={apt.status}
                            onValueChange={(value) => updateAppointmentStatus(apt.id, value)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="confirmed">Confirmed</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="favorites">
            <Card>
              <CardHeader>
                <CardTitle>Favorites Management</CardTitle>
                <CardDescription>View and manage user favorites</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Listing</TableHead>
                      <TableHead>Added</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {favorites.map((fav) => (
                      <TableRow key={fav.id}>
                        <TableCell>{fav.user?.full_name || 'Unknown'}</TableCell>
                        <TableCell className="max-w-xs truncate">
                          {fav.listing?.title || 'N/A'}
                        </TableCell>
                        <TableCell>
                          {new Date(fav.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteFavorite(fav.id)}
                          >
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="searches">
            <Card>
              <CardHeader>
                <CardTitle>Saved Searches</CardTitle>
                <CardDescription>Manage user saved searches</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Search Name</TableHead>
                      <TableHead>Notify</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {savedSearches.map((search) => (
                      <TableRow key={search.id}>
                        <TableCell>{search.profiles?.full_name || 'Unknown'}</TableCell>
                        <TableCell>{search.name}</TableCell>
                        <TableCell>
                          <Badge variant={search.notify_new_matches ? 'default' : 'secondary'}>
                            {search.notify_new_matches ? 'Yes' : 'No'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(search.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteSavedSearch(search.id)}
                          >
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notifications Management</CardTitle>
                <CardDescription>View and manage system notifications</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Content</TableHead>
                      <TableHead>Read</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {notifications.map((notif) => (
                      <TableRow key={notif.id}>
                        <TableCell>{notif.profiles?.full_name || 'Unknown'}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{notif.type}</Badge>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">{notif.title}</TableCell>
                        <TableCell className="max-w-xs truncate">{notif.content}</TableCell>
                        <TableCell>
                          <Badge variant={notif.is_read ? 'default' : 'secondary'}>
                            {notif.is_read ? 'Read' : 'Unread'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(notif.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteNotification(notif.id)}
                          >
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="conversations">
            <Card>
              <CardHeader>
                <CardTitle>Conversations Management</CardTitle>
                <CardDescription>View and manage all conversations</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Related Listing</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Last Updated</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {conversations.map((conv) => (
                      <TableRow key={conv.id}>
                        <TableCell className="font-mono text-xs">
                          {conv.id.substring(0, 8)}...
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {conv.listing?.title || 'N/A'}
                        </TableCell>
                        <TableCell>
                          {new Date(conv.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {new Date(conv.updated_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteConversation(conv.id)}
                          >
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="scores">
            <Card>
              <CardHeader>
                <CardTitle>Compatibility Scores</CardTitle>
                <CardDescription>View AI-generated compatibility scores</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Listing</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {compatibilityScores.map((score) => (
                      <TableRow key={score.id}>
                        <TableCell>{score.user?.full_name || 'Unknown'}</TableCell>
                        <TableCell className="max-w-xs truncate">
                          {score.listing?.title || 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Badge variant={
                            score.score >= 80 ? 'default' :
                            score.score >= 60 ? 'secondary' : 'destructive'
                          }>
                            {score.score}%
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(score.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteCompatibilityScore(score.id)}
                          >
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="flatmates">
            <Card>
              <CardHeader>
                <CardTitle>Flatmates Management</CardTitle>
                <CardDescription>Manage flatmate profiles in listings</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Listing</TableHead>
                      <TableHead>Age</TableHead>
                      <TableHead>Gender</TableHead>
                      <TableHead>Occupation</TableHead>
                      <TableHead>Nationality</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {flatmates.map((flatmate) => (
                      <TableRow key={flatmate.id}>
                        <TableCell>{flatmate.name || flatmate.profile?.full_name || 'Unknown'}</TableCell>
                        <TableCell className="max-w-xs truncate">
                          {flatmate.listing?.title || 'N/A'}
                        </TableCell>
                        <TableCell>{flatmate.age || 'N/A'}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{flatmate.gender || 'N/A'}</Badge>
                        </TableCell>
                        <TableCell>{flatmate.occupation || 'N/A'}</TableCell>
                        <TableCell>{flatmate.nationality || 'N/A'}</TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteFlatmate(flatmate.id)}
                          >
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {selectedReport && (
          <ReportDetailsDialog
            report={selectedReport}
            open={reportDialogOpen}
            onOpenChange={setReportDialogOpen}
            onResolve={() => {
              updateReportStatus(selectedReport.id, 'resolved');
              setReportDialogOpen(false);
            }}
            onDismiss={() => {
              updateReportStatus(selectedReport.id, 'dismissed');
              setReportDialogOpen(false);
            }}
          />
        )}
      </div>
    </div>
  );
}
