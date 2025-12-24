/**
 * APPROVAL WORKFLOW CONSTANTS & HELPERS
 * 
 * This module centralizes all approval-related logic for listings and reviews.
 * 
 * === LISTINGS ===
 * Flow: create → pending → approved → published
 * - is_verified: false = pending/rejected
 * - is_verified: true = approved
 * - is_active: true = published (must also be verified)
 * 
 * A listing is publicly visible ONLY when:
 *   is_verified === true AND is_active === true
 * 
 * === REVIEWS ===
 * Flow: create → pending → approved → visible
 * - status: 'pending' = awaiting admin review
 * - status: 'approved' = visible to public
 * - status: 'rejected' = not visible
 * 
 * A review is publicly visible ONLY when:
 *   status === 'approved'
 */

// ============================================
// LISTING APPROVAL
// ============================================

export const LISTING_STATUS = {
  PENDING: 'pending',      // is_verified = false, is_active = false
  APPROVED: 'approved',    // is_verified = true, is_active = true
  REJECTED: 'rejected',    // is_verified = false, is_active = false
  DEACTIVATED: 'deactivated', // is_verified = true, is_active = false (owner disabled)
} as const;

export type ListingStatus = typeof LISTING_STATUS[keyof typeof LISTING_STATUS];

/**
 * Get the effective status of a listing based on its flags
 */
export function getListingStatus(isVerified: boolean | null, isActive: boolean | null): ListingStatus {
  if (!isVerified) return LISTING_STATUS.PENDING;
  if (isVerified && isActive) return LISTING_STATUS.APPROVED;
  if (isVerified && !isActive) return LISTING_STATUS.DEACTIVATED;
  return LISTING_STATUS.PENDING;
}

/**
 * Check if a listing should be publicly visible
 * CRITICAL: This is the single source of truth for listing visibility
 */
export function isListingPubliclyVisible(isVerified: boolean | null, isActive: boolean | null): boolean {
  return isVerified === true && isActive === true;
}

/**
 * Default values for new listings - ALWAYS create as pending
 */
export const NEW_LISTING_DEFAULTS = {
  is_verified: false,  // Requires admin approval
  is_active: false,    // Not published until approved
} as const;

// ============================================
// REVIEW APPROVAL
// ============================================

export const REVIEW_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
} as const;

export type ReviewStatus = typeof REVIEW_STATUS[keyof typeof REVIEW_STATUS];

/**
 * Check if a review should be publicly visible
 * CRITICAL: This is the single source of truth for review visibility
 */
export function isReviewPubliclyVisible(status: string | null | undefined): boolean {
  return status === REVIEW_STATUS.APPROVED;
}

/**
 * Default status for new reviews - ALWAYS create as pending
 */
export const NEW_REVIEW_DEFAULTS = {
  status: REVIEW_STATUS.PENDING,
} as const;

// ============================================
// SUPABASE QUERY HELPERS
// ============================================

/**
 * Filter object for public listing queries
 * Use with .match() or spread into individual .eq() calls
 */
export const PUBLIC_LISTING_FILTERS = {
  is_verified: true,
  is_active: true,
} as const;

/**
 * Filter value for public review queries
 */
export const PUBLIC_REVIEW_STATUS = REVIEW_STATUS.APPROVED;

// ============================================
// LOGGING HELPERS
// ============================================

/**
 * Log an approval action for audit purposes
 * In production, these logs are sanitized to prevent data leakage
 */
export function logApprovalAction(
  action: 'create' | 'approve' | 'reject' | 'deactivate',
  entityType: 'listing' | 'review',
  entityId: string,
  adminId?: string
) {
  // Only log in development or with debug enabled
  if (process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_DEBUG === 'true') {
    console.info(`[Approval] ${action.toUpperCase()} ${entityType}:`, {
      id: entityId,
      adminId: adminId || 'system',
      timestamp: new Date().toISOString(),
    });
  }
}

