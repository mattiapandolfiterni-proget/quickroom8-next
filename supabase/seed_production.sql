-- ==========================================================
-- QuickRoom8 Production Seed Data
-- ==========================================================
-- PURPOSE: Minimal data required for app to function
-- 
-- USAGE: Run this AFTER the main migration
--        Run these queries in Supabase SQL Editor
--
-- NOTE: This is NOT mock data - this is the minimum required
--       for production functionality
-- ==========================================================

-- ==========================================================
-- STEP 1: DIAGNOSTIC QUERIES
-- Run these first to understand your production state
-- ==========================================================

-- Check existing users
SELECT id, email, created_at FROM auth.users ORDER BY created_at LIMIT 10;

-- Check existing profiles
SELECT id, email, full_name FROM profiles ORDER BY created_at LIMIT 10;

-- Check admin users
SELECT u.email, ur.role FROM user_roles ur JOIN auth.users u ON u.id = ur.user_id;

-- Check listings status
SELECT 
    COUNT(*) as total,
    COUNT(*) FILTER (WHERE is_active = true AND is_verified = true) as approved,
    COUNT(*) FILTER (WHERE is_active = false OR is_verified = false) as pending
FROM room_listings;

-- ==========================================================
-- STEP 2: CREATE ADMIN USER
-- Replace YOUR_USER_ID with your actual UUID from Step 1
-- ==========================================================

-- Option A: Make an existing user admin
/*
INSERT INTO user_roles (user_id, role)
VALUES ('YOUR_USER_ID_HERE', 'admin')
ON CONFLICT (user_id, role) DO UPDATE SET role = 'admin';
*/

-- Option B: Make the FIRST registered user admin (convenient for testing)
INSERT INTO user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users
ORDER BY created_at ASC
LIMIT 1
ON CONFLICT (user_id, role) DO UPDATE SET role = 'admin';

-- Verify admin was created
SELECT u.email, ur.role 
FROM user_roles ur 
JOIN auth.users u ON u.id = ur.user_id 
WHERE ur.role = 'admin';

-- ==========================================================
-- STEP 3: APPROVE ANY EXISTING PENDING LISTINGS
-- Only run this if you have listings that should be visible
-- ==========================================================

-- Show pending listings first
SELECT id, title, owner_id, is_active, is_verified, created_at 
FROM room_listings 
WHERE is_active = false OR is_verified = false;

-- Approve all pending listings (OPTIONAL - admin should review each)
/*
UPDATE room_listings 
SET is_active = true, is_verified = true, updated_at = NOW()
WHERE is_verified = false;
*/

-- Or approve a specific listing by ID:
/*
UPDATE room_listings 
SET is_active = true, is_verified = true, updated_at = NOW()
WHERE id = 'LISTING_UUID_HERE';
*/

-- ==========================================================
-- STEP 4: VERIFY RLS POLICIES ARE WORKING
-- ==========================================================

-- Test public listing visibility (should return approved listings only)
-- Run this as anon/unauthenticated
SELECT id, title, location, price, is_active, is_verified
FROM room_listings
WHERE is_active = true AND is_verified = true
LIMIT 5;

-- Test profile visibility (should return all profiles)
SELECT id, full_name, nationality, occupation
FROM profiles
LIMIT 5;

-- ==========================================================
-- STEP 5: CHECK FOR ORPHANED DATA
-- ==========================================================

-- Listings without owner profile
SELECT rl.id, rl.title, rl.owner_id
FROM room_listings rl
LEFT JOIN profiles p ON p.id = rl.owner_id
WHERE p.id IS NULL;

-- Users without profiles (should be 0 if trigger is working)
SELECT u.id, u.email
FROM auth.users u
LEFT JOIN profiles p ON p.id = u.id
WHERE p.id IS NULL;

-- ==========================================================
-- STEP 6: FIX ORPHANED DATA (if any found in Step 5)
-- ==========================================================

-- Create profiles for users missing them
INSERT INTO profiles (id, email, full_name)
SELECT 
    u.id, 
    u.email, 
    COALESCE(u.raw_user_meta_data->>'full_name', split_part(u.email, '@', 1))
FROM auth.users u
LEFT JOIN profiles p ON p.id = u.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- ==========================================================
-- PRODUCTION READINESS CHECKLIST
-- ==========================================================
-- [ ] At least 1 admin user exists
-- [ ] Profile trigger is working (new signups get profiles)
-- [ ] RLS policies allow public reads on approved listings
-- [ ] No orphaned data exists
-- [ ] (Optional) At least 1 approved listing for homepage

-- ==========================================================
-- FINAL VERIFICATION QUERY
-- Run this to confirm everything is set up correctly
-- ==========================================================
SELECT 
    'Admins' as check_type,
    (SELECT COUNT(*) FROM user_roles WHERE role = 'admin') as count,
    CASE WHEN (SELECT COUNT(*) FROM user_roles WHERE role = 'admin') > 0 
         THEN '✅' ELSE '❌' END as status
UNION ALL
SELECT 
    'Profiles',
    (SELECT COUNT(*) FROM profiles),
    CASE WHEN (SELECT COUNT(*) FROM profiles) >= (SELECT COUNT(*) FROM auth.users)
         THEN '✅' ELSE '⚠️' END
UNION ALL
SELECT 
    'Approved Listings',
    (SELECT COUNT(*) FROM room_listings WHERE is_active = true AND is_verified = true),
    CASE WHEN (SELECT COUNT(*) FROM room_listings WHERE is_active = true AND is_verified = true) > 0 
         THEN '✅' ELSE '⚠️ (Homepage will be empty)' END
UNION ALL
SELECT 
    'Profile Trigger',
    CASE WHEN EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created') THEN 1 ELSE 0 END,
    CASE WHEN EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created') 
         THEN '✅' ELSE '❌' END;

