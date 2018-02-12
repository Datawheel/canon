const lookup = {

  // common
  classes: "common/index",
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
  anchorbutton: "components/button/buttons",
  anchorbuttonfactory: "components/button/buttons",
  breadcrumb: "components/breadcrumbs/breadcrumb",
  button: "components/button/buttons",
  buttonfactory: "components/button/buttons",
  buttongroup: "components/button/buttonGroup",
  callout: "components/callout/callout",
  card: "components/card/card",
  checkbox: "components/forms/controls",
  checkboxfactory: "components/forms/controls",
  collapse: "components/collapse/collapse",
  collapsiblelist: "components/collapsible-list/collapsibleList",
  contextmenutarget: "components/context-menu/contextMenuTarget",
  dialog: "components/dialog/dialog",
  editabletext: "components/editable-text/editableText",
  controlgroup: "components/forms/controlGroup",
  control: "components/forms/controls",
  fileupload: "components/forms/fileUpload",
  formgroup: "components/forms/formGroup",
  hotkeys: "components/hotkeys/hotkeys",
  icon: "components/icon/icon",
  inputgroup: "components/forms/inputGroup",
  label: "components/forms/label",
  menu: "components/menu/menu",
  menudivider: "components/menu/menuDivider",
  menuitem: "components/menu/menuItem",
  navbar: "components/navbar/navbar",
  navbardivider: "components/navbar/navbarDivider",
  navbargroup: "components/navbar/navbarGroup",
  navbarheading: "components/navbar/navbarHeading",
  nonidealstate: "components/non-ideal-state/nonIdealState",
  numericinput: "components/forms/numericInput",
  overlay: "components/overlay/overlay",
  popover: "components/popover/popover",
  popoverfactory: "components/popover/popover",
  popoverinteractionkind: "components/popover/popover",
  portal: "components/portal/portal",
  progressbar: "components/progress/progressBar",
  radio: "components/forms/controls",
  radiofactory: "components/forms/controls",
  radiogroup: "components/forms/radioGroup",
  rangeslider: "components/slider/rangeSlider",
  svgpopover: "components/popover/svgPopover",
  svgtooltip: "components/tooltip/svgTooltip",
  slider: "components/slider/slider",
  spinner: "components/spinner/spinner",
  switch: "components/forms/controls",
  switchfactory: "components/forms/controls",
  svgspinner: "components/spinner/svgSpinner",
  tab: "components/tabs/tab",
  tabs: "components/tabs/tabs",
  tablist: "components/tabs/tabList",
  tabpanel: "components/tabs/tabPanel",
  tab2: "components/tabs2/tab2",
  tabs2: "components/tabs2/tabs2",
  tag: "components/tag/tag",
  text: "components/text/text",
  textarea: "components/forms/textArea",
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
