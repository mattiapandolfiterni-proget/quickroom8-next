"use client";

import dynamic from "next/dynamic";

// Carica App.tsx disattivando SSR (obbligatorio per React Router)
const App = dynamic(() => import("./App"), {
  ssr: false,
});

export default function Page() {
  return <App />;
}
