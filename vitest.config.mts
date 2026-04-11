import react from "@vitejs/plugin-react";
import { fileURLToPath } from "url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    tsconfigPaths: true,
    alias: [
      {
        find: /^.*\.module\.scss$/,
        replacement: fileURLToPath(
          new URL("./__mocks__/fileMock.ts", import.meta.url),
        ),
      },
    ],
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
  },
});
