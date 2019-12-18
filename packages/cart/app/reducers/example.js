import {SET_EXAMPLE_SITE, SET_EXAMPLE_VIZ_BUILDER_URL, ADD_CUSTOM_URL, REMOVE_CUSTOM_URL} from "../actions/example";

const initialState = {
  site: false,
  vizBuilderUrl: false,
  customUrls: []
};

/** Reducer for loading related actions */
export default function exampleReducer(state = initialState, action) {
  let newState;
  switch (action.type) {
    case SET_EXAMPLE_SITE:
      return {
        ...state,
        site: action.payload,
        customUrls: []
      };
    case SET_EXAMPLE_VIZ_BUILDER_URL:
      return {
        ...state,
        vizBuilderUrl: action.payload
      };
    case ADD_CUSTOM_URL:
      newState = state.customUrls;
      newState.push(action.payload);
      return {
        ...state,
        customUrls: [...newState]
      };
    case REMOVE_CUSTOM_URL:
      newState = state.customUrls.filter((u) => u !== action.payload);
      return {
        ...state,
        customUrls: [...newState]
      };
    default:
      // ALWAYS have a default case in a reducer
      return state;
  }
}
