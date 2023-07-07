// eslint-disable-next-line import/no-extraneous-dependencies
import {defineConfig} from "tsup";

export default defineConfig(() => ({
  clean: true,
  entry: ["index.js", "utils.js"],
  format: ["esm"],
  outExtension() {
    return {js: ".js"};
  },
  loader: {".js": "jsx"},
  splitting: false,
  treeshake: true,
}));
