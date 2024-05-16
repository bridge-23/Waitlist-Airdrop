//action.ts

"use server";

import { createClient } from "@/utils/supabase/server";
import { serviceSupabase } from "@/utils/supabase/service";
import { SupabaseClient } from "@supabase/supabase-js";

const SIGN_UP_POINTS = 100;
const SIGN_UP_SULTAN_POINTS = 500;
const REFERRAL_POINTS = 500;
const PLUG_WALLET_POINTS = 200;
const TWITTER_FOLLOW_POINTS = 100;
const DISCORD_JOIN_POINTS = 100;

async function getAuthenticatedUser() {
  const supabase = createClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData || !userData.user) {
    console.error("User is not authenticated", userError);
    return { user: null, error: userError };
  }

  return { user: userData.user, error: null };
}

export async function fetchAccount() {
  const { user, error } = await getAuthenticatedUser();
  if (error || !user) return null;

  const { data: accountData, error: accountError } = await serviceSupabase
    .from("accounts")
    .select("*")
    .eq("id", user.id);

  if (accountError || !accountData || !accountData[0]) {
    return null;
  }

  return accountData[0];
}

export async function claimCode(code: string) {
  const { user, error } = await getAuthenticatedUser();
  if (error || !user) return null;

  const existingAccount = await fetchAccount();

  if (existingAccount) {
    console.error("Account already exists");
    return null;
  }

  const { data: invitorAccountData, error: accountError } =
    await serviceSupabase
      .from("accounts")
      .select("*")
      .eq("invitation_code", code);

  if (accountError || !invitorAccountData || !invitorAccountData[0]) {
    console.error("No account found with that code");
    return false;
  }

  const signUpPoints =
    code === "SULTAN" ? SIGN_UP_SULTAN_POINTS : SIGN_UP_POINTS;

  const { error: createAccountError } = await serviceSupabase
    .from("accounts")
    .insert({
      id: user.id,
      invited_by_account_id: invitorAccountData[0].id,
      email: user.email,
      twitter_handle: "@" + user.user_metadata.preferred_username,
    });

  if (createAccountError) {
    console.error("Error inserting account", createAccountError);
    return false;
  }

  const { error: pointsInsertError } = await serviceSupabase
    .from("points")
    .insert([
      { account_id: user.id, amount: signUpPoints, note: "Sign Up" },
      {
        account_id: invitorAccountData[0].id,
        amount: REFERRAL_POINTS,
        note: `Referral of ${"@" + user.user_metadata.preferred_username}`,
      },
    ]);

  if (pointsInsertError) {
    console.error("Error inserting points", pointsInsertError);
    return false;
  }

  return true;
}

export async function fetchPrincipalId() {
  const { user, error } = await getAuthenticatedUser();
  if (error || !user) return null;

  const { data, error: fetchError } = await serviceSupabase
    .from("accounts")
    .select("principal_id")
    .eq("id", user.id)
    .single();

  if (fetchError) {
    console.error("Error fetching principalId", error);
    return;
  }

  if (data && data.principal_id) {
    return true;
  }
}

export async function savePrincipalId(principalId: string) {
  const { user, error } = await getAuthenticatedUser();
  if (error || !user) return null;

  const { data: existingAccount, error: fetchError } = await serviceSupabase
    .from("accounts")
    .select("principal_id, invited_by_account_id")
    .eq("id", user.id)
    .single();

  if (fetchError) {
    console.error("Error fetching account", fetchError);
    return false;
  }

  const { error: updateError } = await serviceSupabase
    .from("accounts")
    .upsert({ id: user.id, principal_id: principalId });

  if (updateError) {
    console.error("Error updating account with principalId", updateError);
    return false;
  }

  if (!existingAccount.principal_id) {
    const { error: pointsInsertError } = await serviceSupabase
      .from("points")
      .insert({
        account_id: user.id,
        amount: PLUG_WALLET_POINTS,
        note: "Plug Wallet Connection",
      });

    if (pointsInsertError) {
      console.error(
        "Error inserting points for Plug Wallet connection",
        pointsInsertError
      );
      return false;
    }

    if (existingAccount.invited_by_account_id) {
      const { error: inviterPointsError } = await serviceSupabase
        .from("points")
        .insert({
          account_id: existingAccount.invited_by_account_id,
          amount: PLUG_WALLET_POINTS / 10,
          note: "Referral Plug Wallet Connection",
        });
    }
  }

  return true;
}

export async function fetchTwitterFollowed() {
  const { user, error } = await getAuthenticatedUser();
  if (error || !user) return null;

  const { data, error: fetchError } = await serviceSupabase
    .from("points")
    .select("note")
    .eq("account_id", user.id)
    .eq("note", "Follow Galaxy.do on Twitter");

  if (fetchError) {
    console.error("Error fetching note", error);
    return;
  }
  return data.length > 0;
}

export async function twitterPoints() {
  const { user, error } = await getAuthenticatedUser();
  if (error || !user) return null;

  const existingFollow = await fetchTwitterFollowed();

  if (existingFollow) {
    console.log("Points for Twitter follow already added");
    return false;
  }
  const { data: existingAccount, error: fetchError } = await serviceSupabase
    .from("accounts")
    .select("principal_id, invited_by_account_id")
    .eq("id", user.id)
    .single();

  const { error: pointsInsertError } = await serviceSupabase
    .from("points")
    .insert({
      account_id: user.id,
      amount: TWITTER_FOLLOW_POINTS,
      note: "Follow Galaxy.do on Twitter",
    });

  if (pointsInsertError) {
    console.error(
      "Error inserting points for Twitter follow",
      pointsInsertError
    );
    return false;
  }

  if (existingAccount?.invited_by_account_id) {
    const { error: inviterPointsError } = await serviceSupabase
      .from("points")
      .insert({
        account_id: existingAccount.invited_by_account_id,
        amount: TWITTER_FOLLOW_POINTS / 10,
        note: "Referral Twitter Follow",
      });
  }

  return true;
}

export async function fetchDiscordJoined() {
  const { user, error } = await getAuthenticatedUser();
  if (error || !user) return null;

  const { data, error: fetchError } = await serviceSupabase
    .from("points")
    .select("note")
    .eq("account_id", user.id)
    .eq("note", "Joined Discord Galaxy.do");

  if (fetchError) {
    console.error("Error fetching note", error);
    return;
  }
  return data.length > 0;
}

export async function discordPoints() {
  const { user, error } = await getAuthenticatedUser();
  if (error || !user) return null;

  const existingJoin = await fetchDiscordJoined();

  if (existingJoin) {
    console.log("Points for Discord join already added");
    return false;
  }

  const { data: existingAccount, error: fetchError } = await serviceSupabase
    .from("accounts")
    .select("principal_id, invited_by_account_id")
    .eq("id", user.id)
    .single();

  const { error: pointsInsertError } = await serviceSupabase
    .from("points")
    .insert({
      account_id: user.id,
      amount: DISCORD_JOIN_POINTS,
      note: "Joined Discord Galaxy.do",
    });

  if (pointsInsertError) {
    console.error("Error inserting points for Discord join", pointsInsertError);
    return false;
  }

  // if (existingAccount?.invited_by_account_id) {
  //   const { error: inviterPointsError } = await serviceSupabase
  //     .from("points")
  //     .insert({
  //       account_id: existingAccount.invited_by_account_id,
  //       amount: DISCORD_JOIN_POINTS / 10,
  //       note: "Referral Discord Join",
  //     });
  // }

  return true;
}

export async function fetchPointsList() {
  const { user, error } = await getAuthenticatedUser();
  if (error || !user) return null;

  const { data: pointsData, error: pointsError } = await serviceSupabase
    .from("points")
    .select("*")
    .eq("account_id", user.id);

  if (pointsError || !pointsData) {
    return null;
  }

  return pointsData;
}
