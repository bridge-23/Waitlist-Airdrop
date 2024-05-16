// src/utils/share.ts
import { createClient } from "@/utils/supabase/client";

export async function generateShareText(accountId: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("accounts")
    .select("invitation_code")
    .eq("id", accountId);

  if (error) throw error;
  if (!data || data.length === 0) throw new Error("Account not found");

  const invitationCode = data[0].invitation_code;
  const refLink = `https://waitlist.galaxydo.xyz/?invite_code=${invitationCode}`;

  return `I just signed up for the @galaxydoxyz waitlist!

  1. All-in-one canvas workspace
  2. Create and manage your knowledge
  3. Own & Monetize on Blockchain

Use my referral code to join the waitlist & earn bonus points for an airdrop: ${refLink}`;
}