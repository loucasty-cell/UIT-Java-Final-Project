// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
// Architecture A (embedded monolith): disable nitro SSR so `vite build` emits plain SPA dist/ for Spring Boot static.
// TanStack Start CSR still works via client router; SSR is handled by Spring Boot not Nitro.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  nitro: false,
  vite: {
    server: {
      host: "0.0.0.0",
      port: 3000,
      strictPort: true,
      allowedHosts: true,
    },
    build: {
      outDir: "dist",
      emptyOutDir: true,
    },
  },
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // With nitro:false this entry is used for client bundling only.
    server: { entry: "server" },
  },
});
