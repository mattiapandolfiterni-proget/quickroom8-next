"use client";

import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/hooks/useAuth";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { PageLoading } from "@/components/LoadingState";

// Lazy load pages for code splitting
const Index = lazy(() => import("./pages/Index"));
const Auth = lazy(() => import("./pages/Auth"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Browse = lazy(() => import("./pages/Browse"));
const Profile = lazy(() => import("./pages/Profile"));
const Messages = lazy(() => import("./pages/Messages"));
const Favorites = lazy(() => import("./pages/Favorites"));
const ListRoom = lazy(() => import("./pages/ListRoom"));
const RoomDetails = lazy(() => import("./pages/RoomDetails"));
const MyListings = lazy(() => import("./pages/MyListings"));
const Admin = lazy(() => import("./pages/Admin"));
const Appointments = lazy(() => import("./pages/Appointments"));
const ListingStats = lazy(() => import("./pages/ListingStats"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const SafetyTips = lazy(() => import("./pages/SafetyTips"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Contact = lazy(() => import("./pages/Contact"));

export default function App() {
  return (
    <ErrorBoundary>
      <HelmetProvider>
        <LanguageProvider>
          <BrowserRouter>
            <AuthProvider>
              <Suspense fallback={<PageLoading message="Loading page..." />}>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/reset-password/:token" element={<ResetPassword />} />
                  <Route path="/browse" element={<Browse />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/messages" element={<Messages />} />
                  <Route path="/favorites" element={<Favorites />} />
                  <Route path="/list-room" element={<ListRoom />} />
                  <Route path="/room/:id" element={<RoomDetails />} />
                  <Route path="/my-listings" element={<MyListings />} />
                  <Route path="/appointments" element={<Appointments />} />
                  <Route path="/listing-stats/:id" element={<ListingStats />} />
                  <Route path="/admin" element={<Admin />} />
                  <Route path="/terms" element={<TermsOfService />} />
                  <Route path="/terms-of-service" element={<TermsOfService />} />
                  <Route path="/privacy" element={<PrivacyPolicy />} />
                  <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                  <Route path="/onboarding" element={<Onboarding />} />
                  <Route path="/safety-tips" element={<SafetyTips />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </AuthProvider>
          </BrowserRouter>
        </LanguageProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
}
