# QuickRoom8 Production Setup Guide

## 🔴 CRITICAL: Why Production Behaves Differently from Lovable

### Root Cause Analysis

| Issue | Lovable Preview | Production | Impact |
|-------|-----------------|------------|--------|
| **Data** | Pre-seeded test data | Empty tables | No listings shown |
| **Admin** | Test admin user exists | No admin user | Cannot approve listings |
| **RLS** | May be relaxed | Strictly enforced | Queries return empty |
| **Profiles** | Auto-created | May not exist | Profile page crashes |

---

## 🚀 STEP-BY-STEP PRODUCTION SETUP

### Step 1: Run Database Migrations

Open Supabase SQL Editor and run:

```sql
-- ==========================================================
-- MIGRATION 1: Fix Approval Flows
-- ==========================================================

-- 1. ADD STATUS COLUMN TO REVIEWS TABLE (if not exists)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'reviews' AND column_name = 'status'
    ) THEN
        ALTER TABLE reviews ADD COLUMN status TEXT DEFAULT 'pending' 
            CHECK (status IN ('pending', 'approved', 'rejected'));
        UPDATE reviews SET status = 'approved' WHERE status IS NULL;
    END IF;
END $$;

-- 2. ADD STATUS COLUMN TO VIEWING_APPOINTMENTS TABLE (if not exists)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'viewing_appointments' AND column_name = 'status'
    ) THEN
        ALTER TABLE viewing_appointments ADD COLUMN status TEXT DEFAULT 'pending' 
            CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed'));
    END IF;
END $$;

-- 3. ENSURE is_verified AND is_active COLUMNS EXIST ON room_listings
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'room_listings' AND column_name = 'is_verified'
    ) THEN
        ALTER TABLE room_listings ADD COLUMN is_verified BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'room_listings' AND column_name = 'is_active'
    ) THEN
        ALTER TABLE room_listings ADD COLUMN is_active BOOLEAN DEFAULT false;
    END IF;
END $$;

-- 4. CREATE RLS POLICIES FOR LISTINGS
DROP POLICY IF EXISTS "Public listings are viewable by everyone" ON room_listings;
CREATE POLICY "Public listings are viewable by everyone" ON room_listings
    FOR SELECT
    USING (
        (is_active = true AND is_verified = true)
        OR (auth.uid() = owner_id)
        OR (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'))
    );

-- 5. CREATE RLS POLICIES FOR REVIEWS
DROP POLICY IF EXISTS "Reviews are viewable by everyone" ON reviews;
CREATE POLICY "Reviews are viewable by everyone" ON reviews
    FOR SELECT
    USING (
        (status = 'approved')
        OR (auth.uid() = reviewer_id)
        OR (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'))
    );

-- 6. CREATE INDEXES
CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);
CREATE INDEX IF NOT EXISTS idx_room_listings_active_verified ON room_listings(is_active, is_verified);
CREATE INDEX IF NOT EXISTS idx_viewing_appointments_status ON viewing_appointments(status);
```

---

### Step 2: Create Profile Trigger (if missing)

This ensures new users automatically get a profile:

```sql
-- Create profiles table if not exists
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    age INTEGER,
    gender TEXT,
    nationality TEXT,
    occupation TEXT,
    languages TEXT[],
    is_smoker BOOLEAN DEFAULT false,
    has_pets BOOLEAN DEFAULT false,
    cleanliness_level TEXT,
    noise_tolerance TEXT,
    wake_up_time TEXT,
    bed_time TEXT,
    social_preference TEXT,
    work_schedule TEXT,
    budget_min INTEGER,
    budget_max INTEGER,
    preferred_room_type TEXT,
    preferred_locations TEXT[],
    must_have_amenities TEXT[],
    user_type TEXT DEFAULT 'seeker',
    party_friendly BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
DROP POLICY IF EXISTS "Users can view any profile" ON profiles;
CREATE POLICY "Users can view any profile" ON profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Create trigger to auto-create profile on signup
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

-- Create trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Backfill profiles for existing users without profiles
INSERT INTO profiles (id, email, full_name)
SELECT 
    id, 
    email, 
    COALESCE(raw_user_meta_data->>'full_name', split_part(email, '@', 1))
FROM auth.users
WHERE NOT EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.users.id);
```

---

### Step 3: Create Admin User

```sql
-- First, find your user ID (run this and copy the UUID):
SELECT id, email FROM auth.users;

-- Then insert admin role (replace YOUR_USER_ID with actual UUID):
INSERT INTO user_roles (user_id, role)
VALUES ('YOUR_USER_ID_HERE', 'admin')
ON CONFLICT (user_id, role) DO UPDATE SET role = 'admin';
```

---

### Step 4: (Optional) Seed Initial Listing for Testing

After creating admin, go to:
1. `/list-room` - Create a test listing
2. `/admin` - Navigate to Listings tab
3. Click "Verify" then "Activate" on the listing

Or use SQL:

```sql
-- If you have existing listings, approve the first one:
UPDATE room_listings 
SET is_active = true, is_verified = true 
WHERE id = (SELECT id FROM room_listings ORDER BY created_at DESC LIMIT 1);
```

---

## 🔍 VERIFICATION CHECKLIST

Run these queries to verify your setup:

```sql
-- 1. Check if tables have required columns
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'room_listings' AND column_name IN ('is_active', 'is_verified');

SELECT column_name FROM information_schema.columns 
WHERE table_name = 'reviews' AND column_name = 'status';

-- 2. Check admin user exists
SELECT * FROM user_roles WHERE role = 'admin';

-- 3. Check if any approved listings exist
SELECT COUNT(*) as approved_count FROM room_listings 
WHERE is_active = true AND is_verified = true;

-- 4. Check profile trigger exists
SELECT tgname FROM pg_trigger WHERE tgname = 'on_auth_user_created';

-- 5. Check RLS policies exist
SELECT policyname FROM pg_policies WHERE tablename = 'room_listings';
SELECT policyname FROM pg_policies WHERE tablename = 'reviews';
SELECT policyname FROM pg_policies WHERE tablename = 'profiles';
```

---

## ⚠️ COMMON ISSUES

### "No listings appear on homepage"
**Cause:** No listings with `is_active=true AND is_verified=true`
**Fix:** Create a listing and approve it in admin panel

### "Profile page crashes / shows error"
**Cause:** Profile row doesn't exist for user
**Fix:** Run the profile trigger migration above

### "Cannot access admin panel"
**Cause:** No admin role assigned
**Fix:** Insert admin role in `user_roles` table

### "Auth not persisting after refresh"
**Cause:** Environment variable mismatch
**Fix:** Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in Vercel

---

## 🔐 ENVIRONMENT VARIABLES (Vercel)

Required in Vercel Dashboard → Project Settings → Environment Variables:

| Variable | Example | Required |
|----------|---------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxx.supabase.co` | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGc...` | ✅ |
| `NEXT_PUBLIC_SITE_URL` | `https://quickroom8.com` | ⚠️ Recommended |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | `pk.xxx` | Optional (for maps) |

---

## 📋 FINAL PARITY CHECKLIST

Before going live, verify:

- [ ] Migrations run successfully in Supabase SQL Editor
- [ ] Profile trigger exists and works (test with new signup)
- [ ] Admin user created and can access `/admin`
- [ ] At least one approved listing exists
- [ ] Homepage shows featured listings
- [ ] Browse page shows listings
- [ ] Auth (login/signup) works
- [ ] Profile page loads for authenticated user
- [ ] Creating new listing works (starts as pending)
- [ ] Admin can approve/reject listings

---

## 🆘 DEBUGGING

Enable debug logging in production:
1. Add `NEXT_PUBLIC_DEBUG=true` to Vercel environment variables
2. Check browser console for detailed logs

Check Supabase logs:
1. Go to Supabase Dashboard → Database → Logs
2. Look for RLS policy violations or query errors

