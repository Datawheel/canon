import rtlPlugin from "stylis-plugin-rtl";
import {createEmotionCache} from "@mantine/core";

export const rtlCache = createEmotionCache({
  key: "monshaat-rtl",
  prepend: true,
  stylisPlugins: [rtlPlugin]
});

export const ltrCache = createEmotionCache({
  key: "monshaat",
  prepend: true
});
