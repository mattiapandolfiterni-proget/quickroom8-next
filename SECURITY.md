# Security Documentation

## Overview

QuickRoom8 implements a defense-in-depth security model with multiple layers of protection:

1. **Supabase Authentication** - Session-based auth via Supabase Auth
2. **Frontend Guards** - User experience and early rejection
3. **Application-level Security** - Explicit ownership/permission checks in `app/lib/security.ts`
4. **Database RLS** - Supabase Row-Level Security (final authority)

---

## Permission Map

### User Permissions

| Resource | Action | Permission | Enforced By |
|----------|--------|------------|-------------|
| **Profile** | Read own | `profile:read:own` | `user.id === profile.id` |
| **Profile** | Update own | `profile:update:own` | `user.id === profile.id` |
| **Listing** | Create | `listing:create` | Authenticated user |
| **Listing** | Read (public) | `listing:read` | `is_active && is_verified` |
| **Listing** | Update own | `listing:update:own` | `requireListingOwnership()` |
| **Listing** | Delete own | `listing:delete:own` | `requireListingOwnership()` |
| **Message** | Send | `message:send` | `requireConversationParticipant()` |
| **Message** | Read | `message:read:conversation` | `requireConversationParticipant()` |
| **Review** | Create | `review:create` | Authenticated user |
| **Review** | Read (public) | `review:read` | `status === 'approved'` |
| **Appointment** | Create | `appointment:create` | Authenticated user |
| **Appointment** | Update | `appointment:update:own` | `requireAppointmentAccess()` |
| **Favorite** | Create/Delete | `favorite:*:own` | `requireFavoriteOwnership()` |

### Admin Permissions

| Resource | Action | Permission | Enforced By |
|----------|--------|------------|-------------|
| **Listing** | Verify/Reject | `admin:verify:listing` | `requireAdmin()` |
| **Review** | Approve/Reject | `admin:moderate:review` | `requireAdmin()` |
| **Review** | Delete | `admin:delete:review` | `requireAdmin()` |
| **User** | Assign Role | `admin:manage:users` | `requireAdmin()` |
| **Report** | View/Resolve | `admin:view:reports` | `requireAdmin()` |

---

## Security Guards

### Authentication Guard

```typescript
import { requireAuth } from '@/lib/security';

// Throws SecurityError if user is null
requireAuth(user);
```

### Ownership Guards

```typescript
import { 
  requireListingOwnership,
  requireConversationParticipant,
  requireAppointmentAccess,
  requireReviewOwnership,
  requireSavedSearchOwnership,
  requireFavoriteOwnership
} from '@/lib/security';

// All throw SecurityError if check fails
await requireListingOwnership(user, listingId);
await requireConversationParticipant(user, conversationId);
await requireAppointmentAccess(user, appointmentId);
```

### Admin Guard

```typescript
import { requireAdmin } from '@/lib/security';

// Throws SecurityError if user is not admin
await requireAdmin(user);
```

---

## Vulnerabilities Fixed

### 1. Listing Delete Without Ownership Check
**File:** `app/pages/MyListings.tsx`  
**Before:** `.delete().eq('id', deleteId)` - Any user could delete any listing  
**After:** `.delete().eq('id', deleteId).eq('owner_id', user.id)` + explicit ownership verification

### 2. Listing Toggle Without Ownership Check
**File:** `app/pages/MyListings.tsx`  
**Before:** `.update().eq('id', id)` - Any user could activate/deactivate any listing  
**After:** `.update().eq('id', id).eq('owner_id', user.id)` + result verification

### 3. Flatmates Modification Without Listing Ownership
**File:** `app/pages/ListRoom.tsx`  
**Before:** Could modify flatmates on any listing  
**After:** `requireListingOwnership()` check before any modifications

### 4. Message Send Without Participant Check
**File:** `app/pages/Messages.tsx`  
**Before:** Could send messages to any conversation  
**After:** `requireConversationParticipant()` check before sending

### 5. File Upload Without Participant Check
**File:** `app/pages/Messages.tsx`  
**Before:** Could upload files to any conversation  
**After:** `requireConversationParticipant()` check before uploading

### 6. Appointment Update Without Access Check
**File:** `app/pages/Appointments.tsx`  
**Before:** Could update any appointment  
**After:** `requireAppointmentAccess()` + business rule enforcement (requester can only cancel)

### 7. Admin Operations Without Re-verification
**File:** `app/pages/Admin.tsx`  
**Before:** Admin status only checked on page load  
**After:** `requireAdmin()` re-verification on every admin operation

---

## Security Patterns

### Pattern 1: Fail Fast

```typescript
// Always check permissions first, before any database operations
try {
  await requireListingOwnership(user, listingId);
} catch (securityError) {
  logSecurityEvent('LISTING_UPDATE_UNAUTHORIZED', user.id, { listingId });
  toast(handleSecurityError(securityError));
  return; // Exit immediately
}

// Only proceed if check passes
await supabase.from('room_listings').update(...);
```

### Pattern 2: Defense in Depth

```typescript
// Layer 1: Explicit ownership check
await requireListingOwnership(user, listingId);

// Layer 2: Filter in query (in case Layer 1 is bypassed)
const { data } = await supabase
  .from('room_listings')
  .update(...)
  .eq('id', listingId)
  .eq('owner_id', user.id) // CRITICAL: Double-check
  .select()
  .single();

// Layer 3: Verify result
if (!data) {
  throw new Error('Update failed - possible security issue');
}
```

### Pattern 3: Audit Logging

```typescript
import { logSecurityEvent } from '@/lib/security';

// Log all security-relevant events
logSecurityEvent('LISTING_DELETED', user.id, { listingId });
logSecurityEvent('ADMIN_ROLE_ASSIGNED', adminId, { targetUserId, role });
logSecurityEvent('APPOINTMENT_UPDATE_FORBIDDEN', user.id, { 
  appointmentId, 
  attemptedStatus,
  reason: 'Requester can only cancel'
});
```

---

## Error Handling

### Security Errors

| Code | HTTP Status | Message |
|------|-------------|---------|
| `AUTH_REQUIRED` | 401 | "You must be logged in to perform this action" |
| `FORBIDDEN` | 403 | "You are not authorized to perform this action" |
| `NOT_OWNER` | 403 | "You can only modify your own resources" |
| `NOT_PARTICIPANT` | 403 | "You are not a participant in this conversation" |
| `ADMIN_REQUIRED` | 403 | "This action requires admin privileges" |
| `NOT_FOUND` | 404 | "The requested resource was not found" |
| `INVALID_ID` | 400 | "Invalid resource identifier" |

### User-Facing Messages

Security errors are converted to user-friendly toast messages:

```typescript
import { handleSecurityError } from '@/lib/security';

try {
  await requireListingOwnership(user, listingId);
} catch (error) {
  const toastData = handleSecurityError(error);
  toast(toastData);
  // Shows: "Access Denied - You can only modify your own resources"
}
```

---

## Input Validation

### UUID Validation

All resource IDs are validated before use:

```typescript
import { validateUUID } from '@/lib/security';

// Throws INVALID_ID error if not a valid UUID
validateUUID(listingId);
```

---

## Recommendations

### For Production

1. **Enable Supabase RLS** - Ensure all tables have proper RLS policies
2. **Monitor Audit Logs** - Review `[Security Audit]` console logs
3. **Rate Limiting** - Add rate limiting to prevent brute force attacks
4. **HTTPS Only** - Ensure all traffic is encrypted

### For Development

1. **Test Security Paths** - Write tests for unauthorized access attempts
2. **Review New Endpoints** - Every new write operation needs ownership checks
3. **Use Security Module** - Always use guards from `app/lib/security.ts`

---

## Files Modified

| File | Changes |
|------|---------|
| `app/lib/security.ts` | NEW - Centralized security guards |
| `app/pages/ListRoom.tsx` | Added `requireListingOwnership()` |
| `app/pages/MyListings.tsx` | Added ownership checks to delete/toggle |
| `app/pages/Messages.tsx` | Added `requireConversationParticipant()` |
| `app/pages/Appointments.tsx` | Added `requireAppointmentAccess()` |
| `app/pages/Admin.tsx` | Added `requireAdmin()` re-verification |

