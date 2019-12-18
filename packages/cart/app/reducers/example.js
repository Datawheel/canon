import {SET_EXAMPLE_SITE, SET_EXAMPLE_VIZ_BUILDER_URL} from "../actions/example";

const initialState = {
  site: false,
  vizBuilderUrl: false
};

/** Reducer for loading related actions */
export default function exampleReducer(state = initialState, action) {
  switch (action.type) {
    case SET_EXAMPLE_SITE:
      return {
        ...state,
        site: action.payload
      };
    case SET_EXAMPLE_VIZ_BUILDER_URL:
      return {
        ...state,
        vizBuilderUrl: action.payload
      };
    default:
      // ALWAYS have a default case in a reducer
      return state;
  }
}
