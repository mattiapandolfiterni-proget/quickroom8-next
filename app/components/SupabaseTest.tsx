"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function SupabaseTest() {
  const [status, setStatus] = useState<"loading" | "connected" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    const testConnection = async () => {
      try {
        // Test the connection by getting the session
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          setStatus("error");
          setErrorMessage(error.message);
        } else {
          // Connection successful (data.session can be null if not logged in, that's OK)
          setStatus("connected");
        }
      } catch (err: any) {
        setStatus("error");
        setErrorMessage(err?.message || "Network error - cannot reach Supabase");
      }
    };

    testConnection();
  }, []);

  if (status === "loading") {
    return (
      <div className="w-full bg-yellow-500 text-white text-center py-2 text-sm font-medium">
        ⏳ Testing database connection...
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="w-full bg-red-600 text-white text-center py-2 text-sm font-medium">
        ❌ Database Error: {errorMessage}
      </div>
    );
  }

  return (
    <div className="w-full bg-green-600 text-white text-center py-2 text-sm font-medium">
      ✅ Database Connected
    </div>
  );
}

