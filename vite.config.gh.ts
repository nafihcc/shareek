import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";

// Client-only build for GitHub Pages (static hosting, no server runtime).
// Deployed by .github/workflows/deploy-pages.yml. Set BASE_PATH to the
// repository name path (e.g. /faiz/) for project pages.
export default defineConfig({
  base: process.env["BASE_PATH"] || "/",
  define: { "import.meta.env.VITE_STATIC_SPA": JSON.stringify("1") },
  plugins: [react(), tailwindcss(), tsconfigPaths({ projects: ["./tsconfig.json"] })],
  build: {
    outDir: "dist-gh",
    rollupOptions: {
      // entry key "index" produces dist-gh/index.html for GitHub Pages
      input: { index: new URL("./gh-index.html", import.meta.url).pathname },
    },
  },
});
