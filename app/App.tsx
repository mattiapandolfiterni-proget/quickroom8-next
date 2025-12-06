"use client";

import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Lazy load pages (tutte prese da /app/pages)
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

// Loader fallback
const Loader = () => (
  <div style={{ padding: "20px", textAlign: "center" }}>
    <h2>Loading...</h2>
  </div>
);

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loader />}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/browse" element={<Browse />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/list-room" element={<ListRoom />} />
          <Route path="/room-details" element={<RoomDetails />} />
          <Route path="/my-listings" element={<MyListings />} />
          <Route path="/appointments" element={<Appointments />} />
          <Route path="/listing-stats" element={<ListingStats />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/safety-tips" element={<SafetyTips />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}