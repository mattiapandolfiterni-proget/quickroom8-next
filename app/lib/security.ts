/**
 * SECURITY GUARD MODULE
 * 
 * Centralized security checks for authentication, ownership, and permissions.
 * This module is the SINGLE SOURCE OF TRUTH for authorization logic.
 * 
 * SECURITY PRINCIPLES:
 * 1. Fail fast - reject unauthorized requests immediately
 * 2. No frontend trust - always verify on backend/at query time
 * 3. Principle of least privilege - users can only access their own data
 * 4. Defense in depth - multiple layers of protection
 */

import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

// ============================================
// ERROR TYPES
// ============================================

export class SecurityError extends Error {
  public readonly code: string;
  public readonly httpStatus: number;

  constructor(message: string, code: string, httpStatus: number = 403) {
    super(message);
    this.name = 'SecurityError';
    this.code = code;
    this.httpStatus = httpStatus;
  }
}

export const SECURITY_ERRORS = {
  NOT_AUTHENTICATED: new SecurityError(
    'You must be logged in to perform this action',
    'AUTH_REQUIRED',
    401
  ),
  NOT_AUTHORIZED: new SecurityError(
    'You are not authorized to perform this action',
    'FORBIDDEN',
    403
  ),
  NOT_OWNER: new SecurityError(
    'You can only modify your own resources',
    'NOT_OWNER',
    403
  ),
  NOT_ADMIN: new SecurityError(
    'This action requires admin privileges',
    'ADMIN_REQUIRED',
    403
  ),
  NOT_PARTICIPANT: new SecurityError(
    'You are not a participant in this conversation',
    'NOT_PARTICIPANT',
    403
  ),
  RESOURCE_NOT_FOUND: new SecurityError(
    'The requested resource was not found',
    'NOT_FOUND',
    404
  ),
  INVALID_ID: new SecurityError(
    'Invalid resource identifier',
    'INVALID_ID',
    400
  ),
} as const;

// ============================================
// AUTHENTICATION GUARDS
// ============================================

/**
 * Ensure user is authenticated
 * @throws SecurityError if not authenticated
 */
export function requireAuth(user: User | null): asserts user is User {
  if (!user) {
    console.warn('[Security] Auth check failed: No user');
    throw SECURITY_ERRORS.NOT_AUTHENTICATED;
  }
}

/**
 * Get current authenticated user or throw
 * Use this in async contexts where you need to fetch the user
 */
export async function getCurrentUserOrThrow(): Promise<User> {
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    console.warn('[Security] getCurrentUser failed:', error?.message);
    throw SECURITY_ERRORS.NOT_AUTHENTICATED;
  }
  
  return user;
}

// ============================================
// OWNERSHIP GUARDS
// ============================================

/**
 * Verify user owns a profile (profile.id === user.id)
 */
export function requireProfileOwnership(user: User, profileId: string): void {
  requireAuth(user);
  
  if (user.id !== profileId) {
    console.warn('[Security] Profile ownership check failed:', {
      userId: user.id,
      profileId,
    });
    throw SECURITY_ERRORS.NOT_OWNER;
  }
}

/**
 * Verify user owns a listing
 */
export async function requireListingOwnership(
  user: User,
  listingId: string
): Promise<void> {
  requireAuth(user);
  validateUUID(listingId);

  const { data, error } = await supabase
    .from('room_listings')
    .select('owner_id')
    .eq('id', listingId)
    .single();

  if (error || !data) {
    console.warn('[Security] Listing not found:', listingId);
    throw SECURITY_ERRORS.RESOURCE_NOT_FOUND;
  }

  if (data.owner_id !== user.id) {
    console.warn('[Security] Listing ownership check failed:', {
      userId: user.id,
      ownerId: data.owner_id,
      listingId,
    });
    throw SECURITY_ERRORS.NOT_OWNER;
  }
}

/**
 * Verify user is a participant in a conversation
 */
export async function requireConversationParticipant(
  user: User,
  conversationId: string
): Promise<void> {
  requireAuth(user);
  validateUUID(conversationId);

  const { data, error } = await supabase
    .from('conversation_participants')
    .select('user_id')
    .eq('conversation_id', conversationId)
    .eq('user_id', user.id)
    .single();

  if (error || !data) {
    console.warn('[Security] Conversation participant check failed:', {
      userId: user.id,
      conversationId,
    });
    throw SECURITY_ERRORS.NOT_PARTICIPANT;
  }
}

/**
 * Verify user owns an appointment (either as requester or owner)
 */
export async function requireAppointmentAccess(
  user: User,
  appointmentId: string
): Promise<{ isOwner: boolean; isRequester: boolean }> {
  requireAuth(user);
  validateUUID(appointmentId);

  const { data, error } = await supabase
    .from('viewing_appointments')
    .select('owner_id, requester_id')
    .eq('id', appointmentId)
    .single();

  if (error || !data) {
    console.warn('[Security] Appointment not found:', appointmentId);
    throw SECURITY_ERRORS.RESOURCE_NOT_FOUND;
  }

  const isOwner = data.owner_id === user.id;
  const isRequester = data.requester_id === user.id;

  if (!isOwner && !isRequester) {
    console.warn('[Security] Appointment access check failed:', {
      userId: user.id,
      ownerId: data.owner_id,
      requesterId: data.requester_id,
      appointmentId,
    });
    throw SECURITY_ERRORS.NOT_AUTHORIZED;
  }

  return { isOwner, isRequester };
}

/**
 * Verify user owns a review
 */
export async function requireReviewOwnership(
  user: User,
  reviewId: string
): Promise<void> {
  requireAuth(user);
  validateUUID(reviewId);

  const { data, error } = await supabase
    .from('reviews')
    .select('reviewer_id')
    .eq('id', reviewId)
    .single();

  if (error || !data) {
    throw SECURITY_ERRORS.RESOURCE_NOT_FOUND;
  }

  if (data.reviewer_id !== user.id) {
    console.warn('[Security] Review ownership check failed:', {
      userId: user.id,
      reviewerId: data.reviewer_id,
      reviewId,
    });
    throw SECURITY_ERRORS.NOT_OWNER;
  }
}

/**
 * Verify user owns a saved search
 */
export async function requireSavedSearchOwnership(
  user: User,
  searchId: string
): Promise<void> {
  requireAuth(user);
  validateUUID(searchId);

  const { data, error } = await supabase
    .from('saved_searches')
    .select('user_id')
    .eq('id', searchId)
    .single();

  if (error || !data) {
    throw SECURITY_ERRORS.RESOURCE_NOT_FOUND;
  }

  if (data.user_id !== user.id) {
    console.warn('[Security] Saved search ownership check failed:', {
      userId: user.id,
      searchOwnerId: data.user_id,
      searchId,
    });
    throw SECURITY_ERRORS.NOT_OWNER;
  }
}

/**
 * Verify user owns a favorite
 */
export async function requireFavoriteOwnership(
  user: User,
  favoriteId: string
): Promise<void> {
  requireAuth(user);
  validateUUID(favoriteId);

  const { data, error } = await supabase
    .from('favorites')
    .select('user_id')
    .eq('id', favoriteId)
    .single();

  if (error || !data) {
    throw SECURITY_ERRORS.RESOURCE_NOT_FOUND;
  }

  if (data.user_id !== user.id) {
    throw SECURITY_ERRORS.NOT_OWNER;
  }
}

// ============================================
// ADMIN GUARDS
// ============================================

/**
 * Check if user has admin role
 */
export async function isUserAdmin(userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .eq('role', 'admin')
    .single();

  return !error && !!data;
}

/**
 * Require admin privileges
 * @throws SecurityError if not admin
 */
export async function requireAdmin(user: User): Promise<void> {
  requireAuth(user);

  const isAdmin = await isUserAdmin(user.id);
  
  if (!isAdmin) {
    console.warn('[Security] Admin check failed:', user.id);
    throw SECURITY_ERRORS.NOT_ADMIN;
  }
}

/**
 * Check if user is admin or owner of a resource
 */
export async function isAdminOrOwner(
  user: User,
  ownerId: string
): Promise<boolean> {
  if (user.id === ownerId) return true;
  return await isUserAdmin(user.id);
}

// ============================================
// INPUT VALIDATION
// ============================================

/**
 * Validate UUID format to prevent injection attacks
 */
export function validateUUID(id: string): void {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  
  if (!id || !uuidRegex.test(id)) {
    console.warn('[Security] Invalid UUID:', id);
    throw SECURITY_ERRORS.INVALID_ID;
  }
}

/**
 * Sanitize user input to prevent XSS
 * Note: This is a basic sanitizer - use a proper library for production
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

// ============================================
// PERMISSION HELPERS
// ============================================

/**
 * Permission map for different operations
 */
export const PERMISSIONS = {
  // Profile operations
  PROFILE_READ_OWN: 'profile:read:own',
  PROFILE_UPDATE_OWN: 'profile:update:own',
  
  // Listing operations
  LISTING_CREATE: 'listing:create',
  LISTING_READ: 'listing:read',
  LISTING_UPDATE_OWN: 'listing:update:own',
  LISTING_DELETE_OWN: 'listing:delete:own',
  
  // Message operations
  MESSAGE_SEND: 'message:send',
  MESSAGE_READ_CONVERSATION: 'message:read:conversation',
  
  // Review operations
  REVIEW_CREATE: 'review:create',
  REVIEW_READ: 'review:read',
  REVIEW_DELETE_OWN: 'review:delete:own',
  
  // Appointment operations
  APPOINTMENT_CREATE: 'appointment:create',
  APPOINTMENT_UPDATE_OWN: 'appointment:update:own',
  
  // Favorite operations
  FAVORITE_CREATE: 'favorite:create',
  FAVORITE_DELETE_OWN: 'favorite:delete:own',
  
  // Admin operations
  ADMIN_VERIFY_LISTING: 'admin:verify:listing',
  ADMIN_MODERATE_REVIEW: 'admin:moderate:review',
  ADMIN_MANAGE_USERS: 'admin:manage:users',
  ADMIN_VIEW_REPORTS: 'admin:view:reports',
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];

// ============================================
// SECURE QUERY BUILDERS
// ============================================

/**
 * Build a query that filters by owner - ensures user can only see their own data
 */
export function withOwnerFilter<T extends { eq: (col: string, val: string) => T }>(
  query: T,
  user: User,
  ownerColumn: string = 'owner_id'
): T {
  requireAuth(user);
  return query.eq(ownerColumn, user.id);
}

/**
 * Build a query that filters by user_id
 */
export function withUserFilter<T extends { eq: (col: string, val: string) => T }>(
  query: T,
  user: User
): T {
  requireAuth(user);
  return query.eq('user_id', user.id);
}

// ============================================
// ERROR HANDLING HELPERS
// ============================================

/**
 * Handle security errors consistently
 */
export function handleSecurityError(error: unknown): { 
  title: string; 
  description: string; 
  variant: 'destructive' 
} {
  if (error instanceof SecurityError) {
    return {
      title: getErrorTitle(error.code),
      description: error.message,
      variant: 'destructive',
    };
  }
  
  // Generic error - don't leak internal details
  console.error('[Security] Unexpected error:', error);
  return {
    title: 'Error',
    description: 'An unexpected error occurred. Please try again.',
    variant: 'destructive',
  };
}

function getErrorTitle(code: string): string {
  switch (code) {
    case 'AUTH_REQUIRED':
      return 'Authentication Required';
    case 'FORBIDDEN':
    case 'NOT_OWNER':
    case 'NOT_PARTICIPANT':
      return 'Access Denied';
    case 'ADMIN_REQUIRED':
      return 'Admin Required';
    case 'NOT_FOUND':
      return 'Not Found';
    case 'INVALID_ID':
      return 'Invalid Request';
    default:
      return 'Error';
  }
}

// ============================================
// LOGGING HELPERS
// ============================================

/**
 * Log a security event for audit purposes
 */
export function logSecurityEvent(
  event: string,
  userId: string | null,
  details: Record<string, unknown>
): void {
  console.log('[Security Audit]', {
    event,
    userId,
    timestamp: new Date().toISOString(),
    ...details,
  });
}

