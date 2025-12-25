"use client";

import dynamicImport from "next/dynamic";
import { LoadingSpinner } from "@/components/LoadingState";

// Load App.tsx with SSR disabled (required for React Router DOM)
// This is the SPA entry point - React Router handles all client-side routing
const App = dynamicImport(() => import("../App"), {
  ssr: false,
  loading: () => (
    <div
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100"
      role="status"
      aria-label="Loading application"
    >
      <div className="text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center mx-auto shadow-lg animate-pulse">
          <svg
            className="w-8 h-8 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
        </div>
        <div className="space-y-2">
          <h1 className="text-xl font-bold text-slate-800">QuickRoom8</h1>
          <div className="flex items-center justify-center gap-2">
            <LoadingSpinner size="sm" />
            <p className="text-slate-600">Loading...</p>
          </div>
        </div>
      </div>
    </div>
  ),
});

export default function ClientApp() {
  return <App />;
}

