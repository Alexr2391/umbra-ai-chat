import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { supabase } from "@/lib/supabase";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Google],
  pages: {
    signIn: "/",
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google" && account.providerAccountId) {
        await supabase.from("users").upsert(
          {
            email: user.email,
            name: user.name,
            avatar_url: user.image,
            provider: "google",
            provider_id: account.providerAccountId,
          },
          { onConflict: "provider_id" }
        );
      }
      return true;
    },
  },
});
