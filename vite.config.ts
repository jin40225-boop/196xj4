import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";
import { execSync } from "node:child_process";

// Build-time version stamp so we can always tell which commit is deployed.
// Surfaces as window.__WD_VERSION__ in the browser (see src/version.ts).
function gitCommit(): string {
  try {
    return execSync("git rev-parse --short HEAD", { encoding: "utf8" }).trim();
  } catch {
    return "nogit";
  }
}
function gitBranch(): string {
  try {
    return execSync("git rev-parse --abbrev-ref HEAD", { encoding: "utf8" }).trim();
  } catch {
    return "unknown";
  }
}

export default defineConfig({
  plugins: [react()],
  define: {
    __WD_COMMIT__: JSON.stringify(gitCommit()),
    __WD_BRANCH__: JSON.stringify(gitBranch()),
    __WD_BUILT_AT__: JSON.stringify(new Date().toISOString()),
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        admin: resolve(__dirname, "admin.html"),
      },
    },
  },
  server: {
    port: 5176,
    strictPort: true,
  },
});
