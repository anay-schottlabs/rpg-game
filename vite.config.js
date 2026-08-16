import { defineConfig } from "vite";

// Relative base so the build works from any subpath (e.g. GitHub Pages
// project sites at /<repo-name>/) without hardcoding the repo name here.
export default defineConfig({
  base: "./",
});
