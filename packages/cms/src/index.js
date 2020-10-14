import {chunkify} from "@datawheel/canon-core";

// Components
const Builder = chunkify(import(/* webpackChunkName: "cms-builder" */ "./Builder.jsx"));
export {Builder};

const Profile = chunkify(import(/* webpackChunkName: "cms-profile" */ "./components/Profile.jsx"));
const Mirror = chunkify(import(/* webpackChunkName: "cms-profile" */ "./components/Viz/Mirror.jsx"));
const Section = chunkify(import(/* webpackChunkName: "cms-profile" */ "./components/sections/Section.jsx"));
const PDFButton = chunkify(import(/* webpackChunkName: "cms-profile" */ "./components/sections/components/PDFButton.jsx"));
const Selector = chunkify(import(/* webpackChunkName: "cms-profile" */ "./components/sections/components/Selector.jsx"));
const Stat = chunkify(import(/* webpackChunkName: "cms-profile" */ "./components/sections/components/Stat.jsx"));
const Viz = chunkify(import(/* webpackChunkName: "cms-profile" */ "./components/Viz/Viz.jsx"));
const StatGroup = chunkify(import(/* webpackChunkName: "cms-profile" */ "./components/Viz/StatGroup.jsx"));
export {
  Profile,
  Mirror,
  Section,
  PDFButton,
  Selector,
  Stat,
  Viz,
  StatGroup
};

const Story = chunkify(import(/* webpackChunkName: "cms-story" */ "./components/Story.jsx"));
const StoryLanding = chunkify(import(/* webpackChunkName: "cms-story" */ "./components/StoryLanding.jsx"));
export {Story, StoryLanding};

export {default as Search} from "./components/fields/Search.jsx";
export {default as ProfileSearch} from "./components/fields/ProfileSearch.jsx";
export {default as ProfileColumns} from "./components/fields/ProfileColumns.jsx";
export {default as ProfileTile} from "./components/fields/ProfileTile.jsx";

// Redux
export {default as cmsReducer} from "./reducers/index.js";
