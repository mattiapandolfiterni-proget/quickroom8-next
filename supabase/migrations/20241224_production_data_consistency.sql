-- ==========================================================
-- Migration: Production Data Consistency for QuickRoom8
-- Date: 2024-12-24
-- Purpose: Ensure all tables exist, have correct RLS policies,
--          and core data flows work in production
-- ==========================================================

-- ==========================================================
-- SECTION 1: REQUIRED ENUMS (if not exist)
-- ==========================================================
DO $$ BEGIN
    CREATE TYPE app_role AS ENUM ('admin', 'moderator', 'user');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE user_type AS ENUM ('seeker', 'owner', 'tenant');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE room_type AS ENUM ('private', 'ensuite', 'shared');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE contract_type AS ENUM ('short_term', 'long_term', 'flexible');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE gender AS ENUM ('male', 'female', 'other', 'prefer_not_to_say');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE cleanliness_level AS ENUM ('very_clean', 'clean', 'moderate', 'relaxed');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE noise_level AS ENUM ('very_quiet', 'quiet', 'moderate', 'lively');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE social_level AS ENUM ('very_social', 'social', 'moderate', 'private');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE work_schedule AS ENUM ('day', 'night', 'flexible', 'remote');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ==========================================================
-- SECTION 2: CREATE TABLES (if not exist)
-- ==========================================================

-- 2.1 PROFILES TABLE (linked to auth.users)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    age INTEGER,
    gender gender,
    nationality TEXT,
    occupation TEXT,
    languages TEXT[],
    phone TEXT,
    is_smoker BOOLEAN DEFAULT false,
    has_pets BOOLEAN DEFAULT false,
    pets_description TEXT,
    cleanliness_level cleanliness_level,
    noise_tolerance noise_level,
    wake_up_time TEXT,
    bed_time TEXT,
    social_preference social_level,
    work_schedule work_schedule,
    cooking_habits TEXT,
    diet_preferences TEXT,
    visitors_preference TEXT,
    interests TEXT[],
    budget_min INTEGER,
    budget_max INTEGER,
    preferred_room_type room_type,
    preferred_locations TEXT[],
    must_have_amenities TEXT[],
    preferred_flatmate_gender gender,
    preferred_flatmate_age_min INTEGER,
    preferred_flatmate_age_max INTEGER,
    preferred_flatmate_nationality TEXT[],
    user_type user_type DEFAULT 'seeker',
    party_friendly BOOLEAN DEFAULT false,
    is_verified BOOLEAN DEFAULT false,
    is_id_verified BOOLEAN DEFAULT false,
    is_social_verified BOOLEAN DEFAULT false,
    notification_email BOOLEAN DEFAULT true,
    notification_push BOOLEAN DEFAULT true,
    notification_messages BOOLEAN DEFAULT true,
    notification_favorites BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.2 USER_ROLES TABLE (for admin access)
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role app_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, role)
);

-- 2.3 ROOM_LISTINGS TABLE (core)
CREATE TABLE IF NOT EXISTS room_listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    location TEXT NOT NULL,
    address TEXT,
    latitude DECIMAL(10,7),
    longitude DECIMAL(10,7),
    room_type room_type NOT NULL,
    contract_type contract_type NOT NULL DEFAULT 'flexible',
    room_size INTEGER,
    total_bedrooms INTEGER DEFAULT 1,
    total_bathrooms INTEGER DEFAULT 1,
    floor_level INTEGER,
    available_from DATE,
    available_until DATE,
    images TEXT[],
    amenities TEXT[],
    -- Boolean features
    is_furnished BOOLEAN DEFAULT false,
    is_pet_friendly BOOLEAN DEFAULT false,
    bills_included BOOLEAN DEFAULT false,
    has_wifi BOOLEAN DEFAULT false,
    has_ac BOOLEAN DEFAULT false,
    has_heating BOOLEAN DEFAULT false,
    has_parking BOOLEAN DEFAULT false,
    has_lift BOOLEAN DEFAULT false,
    has_balcony BOOLEAN DEFAULT false,
    has_living_room BOOLEAN DEFAULT false,
    has_shared_kitchen BOOLEAN DEFAULT false,
    has_private_bathroom BOOLEAN DEFAULT false,
    has_window BOOLEAN DEFAULT true,
    -- Status flags
    is_active BOOLEAN DEFAULT false,      -- Owner can toggle
    is_verified BOOLEAN DEFAULT false,    -- Admin must approve
    views_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.4 FLATMATES TABLE (linked to listings)
CREATE TABLE IF NOT EXISTS flatmates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID NOT NULL REFERENCES room_listings(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    name TEXT,
    age INTEGER,
    gender gender,
    nationality TEXT,
    occupation TEXT,
    traits TEXT[],
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.5 REVIEWS TABLE
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reviewer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    reviewed_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    listing_id UUID REFERENCES room_listings(id) ON DELETE SET NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.6 VIEWING_APPOINTMENTS TABLE
CREATE TABLE IF NOT EXISTS viewing_appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID NOT NULL REFERENCES room_listings(id) ON DELETE CASCADE,
    requester_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    appointment_date TIMESTAMPTZ NOT NULL,
    notes TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.7 CONVERSATIONS TABLE
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID REFERENCES room_listings(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.8 CONVERSATION_PARTICIPANTS TABLE
CREATE TABLE IF NOT EXISTS conversation_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    last_read_at TIMESTAMPTZ,
    UNIQUE(conversation_id, user_id)
);

-- 2.9 MESSAGES TABLE
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT,
    file_url TEXT,
    message_type TEXT DEFAULT 'text',
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.10 FAVORITES TABLE
CREATE TABLE IF NOT EXISTS favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    listing_id UUID NOT NULL REFERENCES room_listings(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, listing_id)
);

-- 2.11 NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    link TEXT,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.12 SAVED_SEARCHES TABLE
CREATE TABLE IF NOT EXISTS saved_searches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    name TEXT NOT NULL,
    filters JSONB NOT NULL,
    notify_new_matches BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.13 REPORTS TABLE
CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID,
    reported_user_id UUID,
    reported_listing_id UUID REFERENCES room_listings(id) ON DELETE SET NULL,
    reported_message_id UUID REFERENCES messages(id) ON DELETE SET NULL,
    reason TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'dismissed')),
    resolved_by UUID,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.14 SUPPORT_TICKETS TABLE
CREATE TABLE IF NOT EXISTS support_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'resolved', 'closed')),
    admin_notes TEXT,
    resolved_by UUID,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.15 VERIFICATION_REQUESTS TABLE
CREATE TABLE IF NOT EXISTS verification_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    verification_type TEXT NOT NULL CHECK (verification_type IN ('id', 'phone', 'email', 'social')),
    document_url TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    rejection_reason TEXT,
    reviewed_by UUID,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.16 LISTING_BOOSTS TABLE
CREATE TABLE IF NOT EXISTS listing_boosts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID NOT NULL REFERENCES room_listings(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    boost_type TEXT DEFAULT 'standard',
    duration_hours INTEGER NOT NULL,
    payment_amount DECIMAL(10,2) NOT NULL,
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
    stripe_payment_intent_id TEXT,
    starts_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.17 LISTING_VIEWS TABLE
CREATE TABLE IF NOT EXISTS listing_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID NOT NULL REFERENCES room_listings(id) ON DELETE CASCADE,
    viewer_id UUID,
    session_id TEXT,
    viewed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.18 COMPATIBILITY_SCORES TABLE
CREATE TABLE IF NOT EXISTS compatibility_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    listing_id UUID NOT NULL REFERENCES room_listings(id) ON DELETE CASCADE,
    score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
    factors JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, listing_id)
);

-- ==========================================================
-- SECTION 3: ENABLE RLS ON ALL TABLES
-- ==========================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE flatmates ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE viewing_appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_boosts ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE compatibility_scores ENABLE ROW LEVEL SECURITY;

-- ==========================================================
-- SECTION 4: RLS POLICIES FOR PUBLIC ACCESS
-- ==========================================================

-- 4.1 PROFILES: Public can view any profile
DROP POLICY IF EXISTS "profiles_select_all" ON profiles;
CREATE POLICY "profiles_select_all" ON profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- 4.2 USER_ROLES: Only admins can see/manage roles
DROP POLICY IF EXISTS "user_roles_select" ON user_roles;
CREATE POLICY "user_roles_select" ON user_roles FOR SELECT USING (
    auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

DROP POLICY IF EXISTS "user_roles_insert" ON user_roles;
CREATE POLICY "user_roles_insert" ON user_roles FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

DROP POLICY IF EXISTS "user_roles_update" ON user_roles;
CREATE POLICY "user_roles_update" ON user_roles FOR UPDATE USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- 4.3 ROOM_LISTINGS: Public can see approved listings, owners see own
DROP POLICY IF EXISTS "room_listings_select" ON room_listings;
CREATE POLICY "room_listings_select" ON room_listings FOR SELECT USING (
    (is_active = true AND is_verified = true) OR
    (auth.uid() = owner_id) OR
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

DROP POLICY IF EXISTS "room_listings_insert" ON room_listings;
CREATE POLICY "room_listings_insert" ON room_listings FOR INSERT WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "room_listings_update" ON room_listings;
CREATE POLICY "room_listings_update" ON room_listings FOR UPDATE USING (
    auth.uid() = owner_id OR
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

DROP POLICY IF EXISTS "room_listings_delete" ON room_listings;
CREATE POLICY "room_listings_delete" ON room_listings FOR DELETE USING (
    auth.uid() = owner_id OR
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- 4.4 FLATMATES: Public can see flatmates of visible listings
DROP POLICY IF EXISTS "flatmates_select" ON flatmates;
CREATE POLICY "flatmates_select" ON flatmates FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM room_listings 
        WHERE room_listings.id = flatmates.listing_id 
        AND ((is_active = true AND is_verified = true) OR owner_id = auth.uid())
    ) OR
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

DROP POLICY IF EXISTS "flatmates_insert" ON flatmates;
CREATE POLICY "flatmates_insert" ON flatmates FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM room_listings WHERE id = listing_id AND owner_id = auth.uid())
);

DROP POLICY IF EXISTS "flatmates_update" ON flatmates;
CREATE POLICY "flatmates_update" ON flatmates FOR UPDATE USING (
    EXISTS (SELECT 1 FROM room_listings WHERE id = listing_id AND owner_id = auth.uid())
);

DROP POLICY IF EXISTS "flatmates_delete" ON flatmates;
CREATE POLICY "flatmates_delete" ON flatmates FOR DELETE USING (
    EXISTS (SELECT 1 FROM room_listings WHERE id = listing_id AND owner_id = auth.uid())
);

-- 4.5 REVIEWS: Public can see approved reviews
DROP POLICY IF EXISTS "reviews_select" ON reviews;
CREATE POLICY "reviews_select" ON reviews FOR SELECT USING (
    status = 'approved' OR
    auth.uid() = reviewer_id OR
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

DROP POLICY IF EXISTS "reviews_insert" ON reviews;
CREATE POLICY "reviews_insert" ON reviews FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

DROP POLICY IF EXISTS "reviews_update" ON reviews;
CREATE POLICY "reviews_update" ON reviews FOR UPDATE USING (
    auth.uid() = reviewer_id OR
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- 4.6 VIEWING_APPOINTMENTS: Participants can see own appointments
DROP POLICY IF EXISTS "appointments_select" ON viewing_appointments;
CREATE POLICY "appointments_select" ON viewing_appointments FOR SELECT USING (
    auth.uid() = requester_id OR
    auth.uid() = owner_id OR
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

DROP POLICY IF EXISTS "appointments_insert" ON viewing_appointments;
CREATE POLICY "appointments_insert" ON viewing_appointments FOR INSERT WITH CHECK (auth.uid() = requester_id);

DROP POLICY IF EXISTS "appointments_update" ON viewing_appointments;
CREATE POLICY "appointments_update" ON viewing_appointments FOR UPDATE USING (
    auth.uid() = requester_id OR auth.uid() = owner_id
);

-- 4.7 CONVERSATIONS: Participants only
DROP POLICY IF EXISTS "conversations_select" ON conversations;
CREATE POLICY "conversations_select" ON conversations FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM conversation_participants 
        WHERE conversation_id = conversations.id AND user_id = auth.uid()
    )
);

DROP POLICY IF EXISTS "conversations_insert" ON conversations;
CREATE POLICY "conversations_insert" ON conversations FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "conversations_delete" ON conversations;
CREATE POLICY "conversations_delete" ON conversations FOR DELETE USING (
    EXISTS (
        SELECT 1 FROM conversation_participants 
        WHERE conversation_id = conversations.id AND user_id = auth.uid()
    )
);

-- 4.8 CONVERSATION_PARTICIPANTS
DROP POLICY IF EXISTS "participants_select" ON conversation_participants;
CREATE POLICY "participants_select" ON conversation_participants FOR SELECT USING (
    auth.uid() = user_id OR
    EXISTS (
        SELECT 1 FROM conversation_participants cp 
        WHERE cp.conversation_id = conversation_participants.conversation_id 
        AND cp.user_id = auth.uid()
    )
);

DROP POLICY IF EXISTS "participants_insert" ON conversation_participants;
CREATE POLICY "participants_insert" ON conversation_participants FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "participants_delete" ON conversation_participants;
CREATE POLICY "participants_delete" ON conversation_participants FOR DELETE USING (auth.uid() = user_id);

-- 4.9 MESSAGES: Conversation participants only
DROP POLICY IF EXISTS "messages_select" ON messages;
CREATE POLICY "messages_select" ON messages FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM conversation_participants 
        WHERE conversation_id = messages.conversation_id AND user_id = auth.uid()
    )
);

DROP POLICY IF EXISTS "messages_insert" ON messages;
CREATE POLICY "messages_insert" ON messages FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
        SELECT 1 FROM conversation_participants 
        WHERE conversation_id = messages.conversation_id AND user_id = auth.uid()
    )
);

-- 4.10 FAVORITES: Users see own favorites
DROP POLICY IF EXISTS "favorites_select" ON favorites;
CREATE POLICY "favorites_select" ON favorites FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "favorites_insert" ON favorites;
CREATE POLICY "favorites_insert" ON favorites FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "favorites_delete" ON favorites;
CREATE POLICY "favorites_delete" ON favorites FOR DELETE USING (auth.uid() = user_id);

-- 4.11 NOTIFICATIONS: Users see own notifications
DROP POLICY IF EXISTS "notifications_select" ON notifications;
CREATE POLICY "notifications_select" ON notifications FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "notifications_insert" ON notifications;
CREATE POLICY "notifications_insert" ON notifications FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "notifications_update" ON notifications;
CREATE POLICY "notifications_update" ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- 4.12 SAVED_SEARCHES: Users see own searches
DROP POLICY IF EXISTS "saved_searches_select" ON saved_searches;
CREATE POLICY "saved_searches_select" ON saved_searches FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "saved_searches_insert" ON saved_searches;
CREATE POLICY "saved_searches_insert" ON saved_searches FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "saved_searches_update" ON saved_searches;
CREATE POLICY "saved_searches_update" ON saved_searches FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "saved_searches_delete" ON saved_searches;
CREATE POLICY "saved_searches_delete" ON saved_searches FOR DELETE USING (auth.uid() = user_id);

-- 4.13 REPORTS: Reporters see own, admins see all
DROP POLICY IF EXISTS "reports_select" ON reports;
CREATE POLICY "reports_select" ON reports FOR SELECT USING (
    auth.uid() = reporter_id OR
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

DROP POLICY IF EXISTS "reports_insert" ON reports;
CREATE POLICY "reports_insert" ON reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);

DROP POLICY IF EXISTS "reports_update" ON reports;
CREATE POLICY "reports_update" ON reports FOR UPDATE USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- 4.14 SUPPORT_TICKETS: Users see own, admins see all
DROP POLICY IF EXISTS "tickets_select" ON support_tickets;
CREATE POLICY "tickets_select" ON support_tickets FOR SELECT USING (
    auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

DROP POLICY IF EXISTS "tickets_insert" ON support_tickets;
CREATE POLICY "tickets_insert" ON support_tickets FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "tickets_update" ON support_tickets;
CREATE POLICY "tickets_update" ON support_tickets FOR UPDATE USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- 4.15 VERIFICATION_REQUESTS: Users see own, admins see all
DROP POLICY IF EXISTS "verification_select" ON verification_requests;
CREATE POLICY "verification_select" ON verification_requests FOR SELECT USING (
    auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

DROP POLICY IF EXISTS "verification_insert" ON verification_requests;
CREATE POLICY "verification_insert" ON verification_requests FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "verification_update" ON verification_requests;
CREATE POLICY "verification_update" ON verification_requests FOR UPDATE USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- 4.16 LISTING_BOOSTS: Owners see own, admins see all
DROP POLICY IF EXISTS "boosts_select" ON listing_boosts;
CREATE POLICY "boosts_select" ON listing_boosts FOR SELECT USING (
    auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

DROP POLICY IF EXISTS "boosts_insert" ON listing_boosts;
CREATE POLICY "boosts_insert" ON listing_boosts FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "boosts_update" ON listing_boosts;
CREATE POLICY "boosts_update" ON listing_boosts FOR UPDATE USING (
    auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- 4.17 LISTING_VIEWS: Public can insert, owners can select
DROP POLICY IF EXISTS "views_select" ON listing_views;
CREATE POLICY "views_select" ON listing_views FOR SELECT USING (
    EXISTS (SELECT 1 FROM room_listings WHERE id = listing_id AND owner_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

DROP POLICY IF EXISTS "views_insert" ON listing_views;
CREATE POLICY "views_insert" ON listing_views FOR INSERT WITH CHECK (true);

-- 4.18 COMPATIBILITY_SCORES: Users see own
DROP POLICY IF EXISTS "scores_select" ON compatibility_scores;
CREATE POLICY "scores_select" ON compatibility_scores FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "scores_insert" ON compatibility_scores;
CREATE POLICY "scores_insert" ON compatibility_scores FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "scores_update" ON compatibility_scores;
CREATE POLICY "scores_update" ON compatibility_scores FOR UPDATE USING (auth.uid() = user_id);

-- ==========================================================
-- SECTION 5: PROFILE AUTO-CREATION TRIGGER
-- ==========================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Backfill profiles for existing users
INSERT INTO profiles (id, email, full_name)
SELECT 
    id, 
    email, 
    COALESCE(raw_user_meta_data->>'full_name', split_part(email, '@', 1))
FROM auth.users
WHERE NOT EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.users.id)
ON CONFLICT (id) DO NOTHING;

-- ==========================================================
-- SECTION 6: HELPER FUNCTION FOR ADMIN CHECKS
-- ==========================================================
CREATE OR REPLACE FUNCTION public.has_role(_role app_role, _user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM user_roles 
        WHERE user_id = _user_id AND role = _role
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================================
-- SECTION 7: INDEXES FOR PERFORMANCE
-- ==========================================================
CREATE INDEX IF NOT EXISTS idx_room_listings_active_verified ON room_listings(is_active, is_verified);
CREATE INDEX IF NOT EXISTS idx_room_listings_owner_id ON room_listings(owner_id);
CREATE INDEX IF NOT EXISTS idx_room_listings_location ON room_listings(location);
CREATE INDEX IF NOT EXISTS idx_flatmates_listing_id ON flatmates(listing_id);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);
CREATE INDEX IF NOT EXISTS idx_reviews_listing_id ON reviews(listing_id);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON viewing_appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_listing_id ON viewing_appointments(listing_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_participants_conversation_id ON conversation_participants(conversation_id);
CREATE INDEX IF NOT EXISTS idx_participants_user_id ON conversation_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_listing_id ON favorites(listing_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_boosts_listing_id ON listing_boosts(listing_id);
CREATE INDEX IF NOT EXISTS idx_boosts_expires_at ON listing_boosts(expires_at);
CREATE INDEX IF NOT EXISTS idx_views_listing_id ON listing_views(listing_id);

-- ==========================================================
-- END OF MIGRATION
-- ==========================================================

