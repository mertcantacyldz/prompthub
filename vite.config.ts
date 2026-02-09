import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { paraglideVitePlugin } from "@inlang/paraglide-js";
import netlifyPlugin from "@netlify/vite-plugin-react-router";

export default defineConfig({
  plugins: [
    paraglideVitePlugin({
      project: "./project.inlang",
      outdir: "./app/paraglide",
    }),
    tailwindcss(),
    reactRouter(),
    tsconfigPaths(),
    netlifyPlugin(),
  ],
});
