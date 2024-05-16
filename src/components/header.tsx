"use client";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function Hearder() {
  const supabase = createClient();

  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data, error }) => {
      setUser(data.user);
    });
  }, [supabase.auth]);

  function signOut() {
    supabase.auth.signOut().then(() => {
      window.location.href = "/enter";
    });
  }

  if (!user) {
    return null;
  }

  return (
    <header className="absolute top-0 right-0 p-8">
      <div className="flex items-center space-x-4">
        <img
          src={user.user_metadata.avatar_url}
          alt={user.user_metadata.full_name}
          className="w-8 h-8 rounded-full"
        />
        <strong>@{user.user_metadata.preferred_username}</strong>
        <button
          className="text-sm underline underline-offset-4"
          onClick={signOut}
        >
          Log Out
        </button>
      </div>
    </header>
  );
}
