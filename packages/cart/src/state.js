/**
 * Generates a new, empty initial state for the whole Vizbuilder.
 */
export default function initialStateFactory() {
  return {
    internal: {
      loading: true,
      ready: false,
      full: false
    },
    loadingList: [],
    list: {
    },
    settings: {
      pivotYear: {value: true, label: "Pivot Years to Columns"},
      showMOE: {value: false, label: "Show Margin of Error"},
      showID: {value: false, label: "Show ID Columns"}
    }
  };
}
