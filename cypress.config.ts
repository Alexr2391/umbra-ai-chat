import { defineConfig } from "cypress";
import { encode } from "next-auth/jwt";
import { createClient } from "@supabase/supabase-js";

export default defineConfig({
  e2e: {
    baseUrl: "https://umbrachat.netlify.app",
    specPattern: "cypress/e2e/**/*.cy.ts",
    supportFile: "cypress/support/e2e.ts",
    allowCypressEnv: false,
    setupNodeEvents(on, config) {
      on("task", {
        async generateAuthToken({
          email,
          name,
        }: {
          email: string;
          name: string;
        }): Promise<string> {
          const secret = config.env.AUTH_SECRET as string;
          return encode({
            token: { email, name, sub: email },
            secret,
            salt: "__Secure-authjs.session-token",
          });
        },

        async seedTestUser({
          email,
          name,
        }: {
          email: string;
          name: string;
        }): Promise<null> {
          const supabase = createClient(
            config.env.SUPABASE_URL as string,
            config.env.SUPABASE_ANON_KEY as string
          );
          await supabase.from("users").upsert(
            { email, name, provider: "google", provider_id: email },
            { onConflict: "provider_id" }
          );
          return null;
        },
      });
    },
  },
});
