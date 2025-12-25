import ClientApp from "./ClientApp";

// CRITICAL: Force dynamic rendering so Vercel serves this page for ALL routes
// Without this, Next.js may statically optimize and only generate the root path
export const dynamic = "force-dynamic";

// Disable static params generation - this is a fully dynamic catch-all
export const dynamicParams = true;

// Disable caching for this route
export const revalidate = 0;

/**
 * CATCH-ALL ROUTE HANDLER (Server Component)
 *
 * This Next.js page handles ALL routes in the application.
 * It renders the ClientApp which loads React Router DOM for client-side navigation.
 *
 * Supported routes (handled by React Router):
 * - / (Home)
 * - /browse
 * - /list-room
 * - /contact
 * - /safety-tips
 * - /privacy-policy
 * - /terms-of-service
 * - /auth
 * - /profile
 * - /messages
 * - /favorites
 * - /my-listings
 * - /appointments
 * - /admin
 * - /room/:id
 * - etc.
 */
export default function CatchAllPage() {
  return <ClientApp />;
}
