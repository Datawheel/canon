/**
 * Generates a new, empty initial state for the whole Vizbuilder.
 */
export default function initialStateFactory() {
  return {
    internal: {
      ready: false,
      full: false
    },
    list: {

    },
    settings: [
      {key: "pivotYear", value: true, label: "Pivot Years to Columns"},
      {key: "showMOE", value: false, label: "Show Margin of Error"},
      {key: "showID", value: false, label: "Show ID Columns"}
    ]
  };
}
