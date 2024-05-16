import { SupabaseClient } from "@supabase/supabase-js";

export const serviceSupabase = new SupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
