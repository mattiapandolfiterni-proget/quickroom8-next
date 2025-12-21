-- ==========================================================
-- Migration: Fix Approval Flows for QuickRoom8
-- Date: 2024-12-19
-- Description: Add status columns and RLS policies for proper
--              listing and review moderation workflows
-- ==========================================================

-- 1. ADD STATUS COLUMN TO REVIEWS TABLE (if not exists)
-- ==========================================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'reviews' AND column_name = 'status'
    ) THEN
        ALTER TABLE reviews ADD COLUMN status TEXT DEFAULT 'pending' 
            CHECK (status IN ('pending', 'approved', 'rejected'));
        
        -- Set existing reviews to approved (to not break existing data)
        UPDATE reviews SET status = 'approved' WHERE status IS NULL;
        
        RAISE NOTICE 'Added status column to reviews table';
    ELSE
        RAISE NOTICE 'Status column already exists in reviews table';
    END IF;
END $$;

-- 2. ADD STATUS COLUMN TO VIEWING_APPOINTMENTS TABLE (if not exists)
-- ==========================================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'viewing_appointments' AND column_name = 'status'
    ) THEN
        ALTER TABLE viewing_appointments ADD COLUMN status TEXT DEFAULT 'pending' 
            CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed'));
        
        RAISE NOTICE 'Added status column to viewing_appointments table';
    ELSE
        RAISE NOTICE 'Status column already exists in viewing_appointments table';
    END IF;
END $$;

-- 3. ENSURE is_verified AND is_active COLUMNS EXIST ON room_listings
-- ==========================================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'room_listings' AND column_name = 'is_verified'
    ) THEN
        ALTER TABLE room_listings ADD COLUMN is_verified BOOLEAN DEFAULT false;
        RAISE NOTICE 'Added is_verified column to room_listings table';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'room_listings' AND column_name = 'is_active'
    ) THEN
        ALTER TABLE room_listings ADD COLUMN is_active BOOLEAN DEFAULT false;
        RAISE NOTICE 'Added is_active column to room_listings table';
    END IF;
END $$;

-- 4. CREATE OR REPLACE RLS POLICIES FOR SECURE LISTING ACCESS
-- ==========================================================
-- Drop existing select policy if it exists
DROP POLICY IF EXISTS "Public listings are viewable by everyone" ON room_listings;

-- Create new policy: Only show listings that are both active AND verified to public
CREATE POLICY "Public listings are viewable by everyone" ON room_listings
    FOR SELECT
    USING (
        (is_active = true AND is_verified = true) -- Public can only see approved listings
        OR 
        (auth.uid() = owner_id) -- Owners can always see their own listings
        OR
        (EXISTS ( -- Admins can see all listings
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() AND role = 'admin'
        ))
    );

-- 5. CREATE OR REPLACE RLS POLICIES FOR REVIEWS
-- ==========================================================
DROP POLICY IF EXISTS "Reviews are viewable by everyone" ON reviews;

-- Create new policy: Only show approved reviews to public
CREATE POLICY "Reviews are viewable by everyone" ON reviews
    FOR SELECT
    USING (
        (status = 'approved') -- Public can only see approved reviews
        OR 
        (auth.uid() = reviewer_id) -- Reviewers can see their own reviews
        OR
        (EXISTS ( -- Admins can see all reviews
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() AND role = 'admin'
        ))
    );

-- 6. ENSURE PROPER INSERT POLICIES
-- ==========================================================
-- Reviews: Anyone authenticated can submit a review
DROP POLICY IF EXISTS "Users can insert own reviews" ON reviews;
CREATE POLICY "Users can insert own reviews" ON reviews
    FOR INSERT
    WITH CHECK (auth.uid() = reviewer_id);

-- Viewing Appointments: Authenticated users can create appointments
DROP POLICY IF EXISTS "Users can create appointments" ON viewing_appointments;
CREATE POLICY "Users can create appointments" ON viewing_appointments
    FOR INSERT
    WITH CHECK (auth.uid() = requester_id);

-- 7. CREATE INDEXES FOR PERFORMANCE
-- ==========================================================
CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);
CREATE INDEX IF NOT EXISTS idx_room_listings_active_verified ON room_listings(is_active, is_verified);
CREATE INDEX IF NOT EXISTS idx_viewing_appointments_status ON viewing_appointments(status);

-- 8. ADD COMMENTS FOR DOCUMENTATION
-- ==========================================================
COMMENT ON COLUMN reviews.status IS 'Review moderation status: pending (awaiting approval), approved (visible), rejected (not visible)';
COMMENT ON COLUMN room_listings.is_verified IS 'Admin verification status. Must be true along with is_active for public visibility';
COMMENT ON COLUMN room_listings.is_active IS 'Listing active status. Must be true along with is_verified for public visibility';
COMMENT ON COLUMN viewing_appointments.status IS 'Appointment status: pending, confirmed, cancelled, completed';

-- ==========================================================
-- END OF MIGRATION
-- ==========================================================

