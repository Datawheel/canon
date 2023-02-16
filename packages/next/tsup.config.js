import {defineConfig} from "tsup";

export default defineConfig(() => ({
  entry: ["index.js"],
  format: ["esm"],
  target: "node14",
  loader: {".js": "jsx"},
  splitting: true,
  outExtension() {
    return {js: ".js"};
  },
}));
