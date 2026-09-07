import { defineConfig, searchForWorkspaceRoot } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5185,
    fs: {
      // Data lives in packages/org-doctrine-model, packages/c2-interfaces, and missions/ at
      // the repo root — this app reads it via the workspace root, not a copy.
      allow: [searchForWorkspaceRoot(process.cwd())],
    },
  },
});
