import {defineConfig} from "tsup";

export default defineConfig(options => ({
  clean: !options.watch,
  entry: ["index.js", "utils.js"],
  bundle: true,
  format: ["esm"],
  outExtension() {
    return {js: ".js"};
  },
  loader: {".js": "jsx"},
  splitting: false,
  treeshake: true
}));
