import {defineConfig} from "tsup";

export default defineConfig(() => ({
  entry: ["index.js"],
  format: ["esm"],
  loader: {".js": "jsx"},
  outExtension() {
    return {js: ".js"};
  }
}));
