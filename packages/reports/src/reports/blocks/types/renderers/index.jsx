import {BLOCK_TYPES} from "../../../../utils/consts/cms";

import ParagraphPreview from "./Paragraph";
import StatPreview from "./Stat";
import SubtitlePreview from "./Subtitle";
import TitlePreview from "./Title";
import SelectorPreview from "./Selector";
import VizPreview from "./Viz";
import GeneratorPreview from "./Generator";
import ImagePreview from "./Image";

export default {
  [BLOCK_TYPES.PARAGRAPH]: ParagraphPreview,
  [BLOCK_TYPES.STAT]: StatPreview,
  [BLOCK_TYPES.SUBTITLE]: SubtitlePreview,
  [BLOCK_TYPES.TITLE]: TitlePreview,
  [BLOCK_TYPES.SELECTOR]: SelectorPreview,
  [BLOCK_TYPES.VIZ]: VizPreview,
  [BLOCK_TYPES.GENERATOR]: GeneratorPreview,
  [BLOCK_TYPES.IMAGE]: ImagePreview
};
