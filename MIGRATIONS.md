# Database Migrations Required

## Overview

This document describes required Supabase database migrations to support the strict approval workflow for listings and reviews.

---

## Migration 1: Add `status` Column to Reviews Table

**Required for**: Review approval workflow  
**Priority**: HIGH - Required for review moderation to work

### SQL Migration

```sql
-- Add status column to reviews table for approval workflow
-- Default to 'pending' so existing reviews remain hidden until approved

ALTER TABLE public.reviews 
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending';

-- Add check constraint to ensure valid status values
ALTER TABLE public.reviews 
ADD CONSTRAINT reviews_status_check 
CHECK (status IN ('pending', 'approved', 'rejected'));

-- Create index for faster filtering on status
CREATE INDEX IF NOT EXISTS idx_reviews_status ON public.reviews(status);

-- Optional: Update existing reviews to 'approved' if you want to grandfather them in
-- UPDATE public.reviews SET status = 'approved' WHERE status IS NULL;
```

### Rollback

```sql
ALTER TABLE public.reviews DROP CONSTRAINT IF EXISTS reviews_status_check;
DROP INDEX IF EXISTS idx_reviews_status;
ALTER TABLE public.reviews DROP COLUMN IF EXISTS status;
```

---

## Migration 2: Enforce Listing Approval via RLS (Recommended)

**Required for**: Backend-enforced listing visibility  
**Priority**: MEDIUM - Adds defense-in-depth (frontend already filters)

### SQL Migration

```sql
-- RLS Policy: Only show active AND verified listings to public
-- Owners can always see their own listings

CREATE POLICY "Public can view approved listings" ON public.room_listings
FOR SELECT
USING (
  (is_active = true AND is_verified = true)
  OR (owner_id = auth.uid())
);

-- Optional: Prevent users from setting is_verified = true on their own listings
CREATE POLICY "Only admins can verify listings" ON public.room_listings
FOR UPDATE
USING (
  -- Allow owner updates that don't touch verification
  (owner_id = auth.uid() AND is_verified = OLD.is_verified)
  -- Or admin can update anything
  OR EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);
```

---

## Migration 3: Enforce Review Approval via RLS (Recommended)

**Required for**: Backend-enforced review visibility  
**Priority**: MEDIUM - Adds defense-in-depth (frontend already filters)

### SQL Migration

```sql
-- RLS Policy: Only show approved reviews to public
-- Reviewers can see their own reviews regardless of status

CREATE POLICY "Public can view approved reviews" ON public.reviews
FOR SELECT
USING (
  status = 'approved'
  OR reviewer_id = auth.uid()
);

-- Only admins can update review status
CREATE POLICY "Only admins can moderate reviews" ON public.reviews
FOR UPDATE
USING (
  -- Reviewers can't change status
  (reviewer_id = auth.uid() AND status = OLD.status)
  -- Admins can update anything
  OR EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);
```

---

## Verification Checklist

After running migrations, verify:

1. **Review Status Column Exists**
   ```sql
   SELECT column_name, data_type, column_default 
   FROM information_schema.columns 
   WHERE table_name = 'reviews' AND column_name = 'status';
   ```

2. **New Reviews Default to Pending**
   - Create a test review
   - Verify `status = 'pending'`

3. **Only Approved Reviews Visible**
   - Query reviews without admin role
   - Verify only `status = 'approved'` rows returned

4. **Listings Require Approval**
   - Create a new listing
   - Verify `is_verified = false` and `is_active = false`
   - Verify not visible in Browse/Index pages
   - Approve in admin panel
   - Verify now visible

---

## Approval Workflow Summary

### Listings

```
CREATE → is_verified=false, is_active=false (PENDING)
                ↓
        [Admin Reviews]
                ↓
        ┌───────┴───────┐
        ↓               ↓
    APPROVE         REJECT
is_verified=true   is_verified=false
is_active=true     is_active=false
  (PUBLISHED)       (REJECTED)
```

### Reviews

```
CREATE → status='pending' (PENDING)
                ↓
        [Admin Reviews]
                ↓
        ┌───────┴───────┐
        ↓               ↓
    APPROVE         REJECT
status='approved'  status='rejected'
   (VISIBLE)        (HIDDEN)
```

---

## Frontend Enforcement Summary

| Feature | File | Filter |
|---------|------|--------|
| Browse listings | `Browse.tsx` | `.eq('is_active', true).eq('is_verified', true)` |
| Featured rooms | `Index.tsx` | `.eq('is_active', true).eq('is_verified', true)` |
| Single listing | `RoomDetails.tsx` | Frontend check: allows owner to view own pending listings |
| Public reviews | `ReviewsList.tsx` | `.eq('status', 'approved')` |
| Create review | `AddReview.tsx` | `status: 'pending'` on insert |
| Create listing | `ListRoom.tsx` | `is_active: false, is_verified: false` on insert |

---

## Contact

For migration support, contact the development team.

