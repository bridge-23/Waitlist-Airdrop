/* eslint-disable react/no-unescaped-entities */
// src/components/waitlist-entrance.tsx
"use client";
import React, { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "./ui/button";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

export default function WaitlistEntrance() {
  async function signInWithTwitter() {
    "use client";
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "twitter",
    });
  }

  return (
    <div className="body-background flex items-center justify-center min-h-screen overflow-hidden mb-20">
      <Card className="w-full max-w-md bg-opacity-80 p-6 rounded-lg">
        <CardHeader>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-white">Galaxy.do Waitlist</CardTitle>
            <div className="pt-2 flex flex-col gap-4 text-sm text-muted-foreground">
              <div className="pt-2 flex flex-col gap-4 text-sm text-muted-foreground">
                <div>We're building your new digital workspace, reimagined as a state-of-the-art whiteboard, allowing you to organize, share, and monetize your knowledge. With AI integration, browser features and enhanced with a decentralized storage option for personal data sovereignty.</div>
                <div>Join the waitlist now to earn airdrop points and early access to our app!</div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button
              onClick={signInWithTwitter}
              className="w-full font-bold text-foreground"
              variant="specialAction"
            >
              <Image
                src="/images/twitter.png"
                alt="twitter"
                width={24}
                height={24}
                className="mr-2"
              />
              Sign in with X / Twitter
            </Button >
          </CardContent>
        </CardHeader>
      </Card>
    </div>
  );
}
