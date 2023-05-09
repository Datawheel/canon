import {defineConfig} from "tsup";

export default defineConfig(options => ({
  clean: !options.watch,
  entry: ["index.js"],
  bundle: true,
  format: ["esm"],
  outExtension() {
    return {js: ".js"};
  },
  loader: {".js": "jsx"},
  shims: true,
  splitting: false,
  treeshake: true,
  external: ["CustomSections"]
}));
