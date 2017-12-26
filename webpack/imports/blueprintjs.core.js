const lookup = {

  // common
  intent: "common/intent",
  interactionMode: "common/interactionMode",
  keys: "common/keys",
  position: "common/position",
  props: "common/props",
  tetherUtils: "common/tetherUtils",
  utils: "common/utils",

  // compatibility
  browser: "compatibility/browser",

  // components
  alert: "components/alert/alert",
  breadcrumb: "components/breadcrumbs/breadcrumb",
  buttons: "components/button/buttons",
  buttongroup: "components/button/buttonGroup",
  callout: "components/callout/callout",
  card: "components/card/card",
  collapse: "components/collapse/collapse",
  collapsiblelist: "components/collapsible-list/collapsibleList",
  contextmenutarget: "components/context-menu/contextMenuTarget",
  dialog: "components/dialog/dialog",
  editabletext: "components/editable-text/editableText",
  controlgroup: "components/forms/controlGroup",
  controls: "components/forms/controls",
  fileupload: "components/forms/fileUpload",
  formgroup: "components/forms/formGroup",
  inputgroup: "components/forms/inputGroup",
  label: "components/forms/label",
  numericinput: "components/forms/numericInput",
  radiogroup: "components/forms/radioGroup",
  textarea: "components/forms/textArea",
  hotkeys: "components/hotkeys/hotkeys",
  icon: "components/icon/icon",
  menu: "components/menu/menu",
  menudivider: "components/menu/menuDivider",
  menuitem: "components/menu/menuItem",
  navbar: "components/navbar/navbar",
  navbardivider: "components/navbar/navbarDivider",
  navbargroup: "components/navbar/navbarGroup",
  navbarheading: "components/navbar/navbarHeading",
  nonidealstate: "components/non-ideal-state/nonIdealState",
  overlay: "components/overlay/overlay",
  text: "components/text/text",
  popover: "components/popover/popover",
  svgpopover: "components/popover/svgPopover",
  portal: "components/portal/portal",
  progressbar: "components/progress/progressBar",
  svgtooltip: "components/tooltip/svgTooltip",
  rangeslider: "components/slider/rangeSlider",
  slider: "components/slider/slider",
  spinner: "components/spinner/spinner",
  svgspinner: "components/spinner/svgSpinner",
  tab: "components/tabs/tab",
  tabs: "components/tabs/tabs",
  tablist: "components/tabs/tabList",
  tabpanel: "components/tabs/tabPanel",
  tab2: "components/tabs2/tab2",
  tabs2: "components/tabs2/tabs2",
  tag: "components/tag/tag",
  toast: "components/toast/toast",
  toaster: "components/toast/toaster",
  tooltip: "components/tooltip/tooltip",
  tree: "components/tree/tree",
  treeNode: "components/tree/treeNode"
};

module.exports = function(importName) {
  const lower = importName.toLowerCase();
  if (lookup[lower]) return `@blueprintjs/core/dist/esm/${lookup[lower]}`;
  else return "@blueprintjs/core";
};
