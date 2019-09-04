/**
 * Generates a new, empty initial state for the whole Cart.
 */
export default function initialStateFactory() {
  return {
    internal: {
      processing: false,
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
    },
    controls: {
      sharedDimensions: [],
      selectedSharedDimensionLevel: false,
      dateDimensions: [],
      selectedDateDimensionLevel: false
    }
  };
}
