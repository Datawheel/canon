import {defineConfig} from "tsup";

export default defineConfig(options => ({
  clean: !options.watch,
  entry: ["index.ts"],
  bundle: true,
  format: ["esm"],
  outExtension() {
    return {js: ".js"};
  },
  tsconfig: "./tsconfig.ts",
  loader: {".js": "jsx"},
  shims: true,
  splitting: false,
  treeshake: true,
  external: ["CustomSections"]
}));
