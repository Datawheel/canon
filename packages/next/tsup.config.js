import {defineConfig} from "tsup";

export default defineConfig(options => ({
  clean: true,
  entry: ["index.js"],
  bundle: true,
  format: ["esm"],
  target: "es2016",
  outExtension() {
    return {js: ".js"};
  },
  loader: {".js": "jsx"},
  // shims: true,
  splitting: false,
  treeshake: true,
  external: ["CustomSections"]
}));
