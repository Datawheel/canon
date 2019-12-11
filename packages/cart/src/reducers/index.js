import initialState from "../state";
import localforage from "localforage";
import {
  INIT_CART,
  CLEAR_CART,
  ADD_TO_CART,
  ADDING_TO_CART,
  REMOVE_FROM_CART,
  TOGGLE_CART_SETTING,
  TOGGLE_CUT_SELECTION,
  TOGGLE_DRILLDOWN_SELECTION,
  LOAD_DATASETS,
  SUCCESS_LOAD_DATASET,
  START_PROCESSING_DATASETS,
  END_PROCESSING_DATASETS,
  SET_SHARED_DIMENSION_LIST,
  SET_DATE_DIMENSION_LIST,
  SHARED_DIMENSION_CHANGED,
  DATE_DIMENSION_CHANGED,
  SAVE_RESPONSES
} from "../actions";
import {STORAGE_CART_KEY, MAX_DATASETS_IN_CART} from "../helpers/consts";

/** Persist state in Local Storage */
function setLocalForageState(newState) {
  const stateToLocalForage = Object.assign({}, initialState());
  const newInstance = Object.assign({}, newState);
  stateToLocalForage.urls = [];

  // Clean calculated urls info, just save in storage the url string
  Object.keys(newInstance.list).map(id => {
    stateToLocalForage.urls.push({url: newInstance.list[id].url, originalUrl: newInstance.list[id].originalUrl});
  });
  delete stateToLocalForage.list;
  stateToLocalForage.settings = Object.assign({}, newInstance.settings);
  localforage.setItem(STORAGE_CART_KEY, stateToLocalForage);
}

/** Are all datasets loaded ? */
function allDatasetsLoaded(list) {
  const ids = Object.keys(list);
  let loaded = 0;
  ids.map(id => {
    loaded += list[id].isLoaded ? 1 : 0;
  });
  return ids.length === loaded;
}

/** Retrieve a list of loading datasets */
function getLoadingIds(list) {
  const ids = Object.keys(list);
  const loading = [];
  ids.map(id => {
    if (!list[id].isLoaded) {
      loading.push(id);
    }
  });
  return loading;
}

/** Disable drilldowns based on selected shared/date dimensions */
function disableDrilldownsBySelected(list, shareDimension, dateDimension) {
  const shareDim = shareDimension ? shareDimension.dimension : false;
  const dateDim = dateDimension ? dateDimension.dimension : false;
  Object.keys(list).map(key => {
    list[key].query.params.drilldowns = list[key].query.params.drilldowns.map(d => {
      const match = d.dimension === shareDim || d.dimension === dateDim;
      return {
        ... d,
        ...{available: !match, selected: !match}
      };
    });
  });
  return list;
}

/**
 * Cart reducer
 */
function cartStateReducer(state = initialState(), action) {
  let newState, tempObj;

  switch (action.type) {

    case INIT_CART: {
      tempObj = initialState();
      newState = Object.assign(
        tempObj,
        action.payload ? {
          list: {
            ...tempObj.list,
            ...action.payload.list
          },
          settings: {
            ...tempObj.settings,
            ...action.payload.settings
          }
        } : {}
      );
      newState.internal.ready = true;
      newState.internal.loading = newState.list && Object.keys(newState.list).length > 0 ? true : false;
      return newState;
    }

    case CLEAR_CART: {
      newState = {
        ...initialState(),
        internal: {
          full: false,
          ready: true,
          loading: false
        }
      };
      setLocalForageState(newState);
      return newState;
    }

    case ADDING_TO_CART: {
      newState = {
        ...state,
        internal: {
          ...state.internal,
          addingUrl: action.payload
        }
      };
      return newState;
    }

    case ADD_TO_CART: {
      newState = {
        ...state,
        list: {
          ...state.list,
          [`${action.payload.id}`]: action.payload
        },
        internal: {
          ...state.internal,
          addingUrl: false,
          full: Object.keys(state.list).length === MAX_DATASETS_IN_CART ? true : false
        }
      };
      setLocalForageState(newState);
      return newState;
    }

    case REMOVE_FROM_CART: {
      newState = Object.assign({}, state.list);
      delete newState[action.payload.id];
      newState = {
        ...state,
        list: {
          ...newState
        },
        internal: {
          ...state.internal,
          full: Object.keys(newState).length === MAX_DATASETS_IN_CART ? true : false
        }
      };
      setLocalForageState(newState);
      return newState;
    }

    case TOGGLE_CART_SETTING: {
      tempObj = Object.assign({}, state.settings);
      tempObj[action.payload.id].value = !tempObj[action.payload.id].value;
      newState = {
        ...state,
        settings: {
          ...state.settings,
          ...tempObj
        }
      };
      setLocalForageState(newState);
      return newState;
    }

    case TOGGLE_CUT_SELECTION: {
      tempObj = Object.assign({}, state.list[`${action.payload.datasetId}`]);
      tempObj = tempObj.query.params.cuts.map(c => {
        const selectedObj = Object.assign({}, c);
        if (action.payload.dimension === c.dimension) {
          selectedObj.selected = action.payload.value;
        }
        return selectedObj;
      });
      newState = {
        ...state,
        list: {
          ...state.list,
          [`${action.payload.datasetId}`]: {
            ...state.list[`${action.payload.datasetId}`],
            query: {
              ...state.list[`${action.payload.datasetId}`].query,
              params: {
                ...state.list[`${action.payload.datasetId}`].query.params,
                cuts: [...tempObj]
              }
            }
          }
        }
      };
      return newState;
    }

    case TOGGLE_DRILLDOWN_SELECTION: {
      tempObj = Object.assign({}, state.list[`${action.payload.datasetId}`]);
      tempObj = tempObj.query.params.drilldowns.map(c => {
        const selectedObj = Object.assign({}, c);
        if (action.payload.dimension === c.dimension) {
          selectedObj.selected = action.payload.value;
        }
        return selectedObj;
      });
      newState = {
        ...state,
        list: {
          ...state.list,
          [`${action.payload.datasetId}`]: {
            ...state.list[`${action.payload.datasetId}`],
            query: {
              ...state.list[`${action.payload.datasetId}`].query,
              params: {
                ...state.list[`${action.payload.datasetId}`].query.params,
                drilldowns: [...tempObj]
              }
            }
          }
        }
      };
      return newState;
    }

    case LOAD_DATASETS: {
      tempObj = Object.assign({}, state.list);
      Object.keys(tempObj).map(id => {
        tempObj[id].isLoaded = false;
        return tempObj[id];
      });
      newState = {
        ...state,
        list: {
          ...state.list,
          ...tempObj
        },
        loadingList: getLoadingIds(tempObj),
        internal: {
          ...state.internal,
          loading: true
        }
      };
      return newState;
    }

    case SUCCESS_LOAD_DATASET: {
      tempObj = {
        ...state.list,
        [`${action.payload.id}`]: {
          ...state.list[`${action.payload.id}`],
          isLoaded: true
        }
      };
      newState = {
        ...state,
        list: {
          ...state.list,
          ...tempObj
        },
        loadingList: getLoadingIds(tempObj),
        internal: {
          ...state.internal,
          processing: allDatasetsLoaded(tempObj)
        }
      };
      return newState;
    }

    case START_PROCESSING_DATASETS: {
      newState = {
        ...state,
        internal: {
          ...state.internal,
          loading: true,
          processing: true
        }
      };
      return newState;
    }

    case END_PROCESSING_DATASETS: {
      newState = {
        ...state,
        internal: {
          ...state.internal,
          processing: false,
          loading: false
        },
        results: {
          ...state.results,
          cols: action.payload.cols,
          data: action.payload.data
        }
      };
      return newState;
    }

    case SET_SHARED_DIMENSION_LIST: {
      newState = {
        ...state,
        controls: {
          ...state.controls,
          sharedDimensions: action.payload.dimensions
        }
      };
      return newState;
    }

    case SET_DATE_DIMENSION_LIST: {
      newState = {
        ...state,
        controls: {
          ...state.controls,
          dateDimensions: action.payload.dimensions
        }
      };
      return newState;
    }

    case SHARED_DIMENSION_CHANGED: {
      const tempObj = disableDrilldownsBySelected(state.list, action.payload.id, state.controls.selectedDateDimensionLevel);

      newState = {
        ...state,
        list: {
          ...tempObj
        },
        controls: {
          ...state.controls,
          selectedSharedDimensionLevel: action.payload.id
        }
      };
      return newState;
    }

    case DATE_DIMENSION_CHANGED: {
      const tempObj = disableDrilldownsBySelected(state.list, state.controls.selectedSharedDimensionLevel, action.payload.id);

      newState = {
        ...state,
        list: {
          ...tempObj
        },
        controls: {
          ...state.controls,
          selectedDateDimensionLevel: action.payload.id
        }
      };
      return newState;
    }

    case SAVE_RESPONSES: {
      newState = {
        ...state,
        results: {
          ...state.results,
          responses: action.payload.responses
        }
      };
      return newState;
    }


    default: {
      return state;
    }
  }
}

export default cartStateReducer;
