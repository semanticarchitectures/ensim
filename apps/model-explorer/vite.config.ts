import { defineConfig, searchForWorkspaceRoot } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    fs: {
      // Data lives in packages/org-doctrine-model, outside this app's own
      // directory — this app reads it via the workspace root, not a copy.
      allow: [searchForWorkspaceRoot(process.cwd())],
    },
  },
});
