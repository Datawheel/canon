import React from "react";
import {connect} from "react-redux";
import {doUpdateDataset} from "../actions/middleware";
import {selectMeasureListByTable} from "../selectors/listsDerived";
import {selectCube, selectMeasure} from "../selectors/queryRaw";
import ConditionalAnchor from "./ConditionalAnchor";
import DatasetSelect from "./DatasetSelect";

/**
 * @typedef OwnProps
 * @property {string} [className]
 */

/**
 * @typedef StateProps
 * @property {CubeItem|undefined} [cube]
 * @property {MeasureItem|undefined} [measure]
 * @property {MeasureItem[]} tableMeasures
 */

/**
 * @typedef DispatchProps
 * @property {(event: React.ChangeEvent<HTMLSelectElement>) => void} setDatasetHandler
 */

/** @type {React.FC<OwnProps&StateProps&DispatchProps>} */
const ControlSources = function({cube, measure, tableMeasures, setDatasetHandler}) {
  if (!cube || !measure) {
    return null;
  }

  return (
    <fieldset className="control sources">
      {cube.sourceName && (
        <p>
          <span>Source: </span>
          <ConditionalAnchor className="source-link" href={cube.sourceHref}>
            {cube.sourceName}
          </ConditionalAnchor>
        </p>
      )}

      {cube.sourceDescription && <p>{cube.sourceDescription}</p>}

      {cube.datasetName && (
        <p>
          <span>Dataset: </span>
          <DatasetSelect
            fill
            measure={measure}
            measures={tableMeasures}
            onChange={setDatasetHandler}
          />
        </p>
      )}
    </fieldset>
  );
};

/** @type {import("react-redux").MapStateToProps<StateProps,OwnProps,GeneralState>} */
function mapState(state) {
  return {
    cube: selectCube(state),
    measure: selectMeasure(state),
    tableMeasures: selectMeasureListByTable(state)
  };
}

/** @type {import("react-redux").MapDispatchToPropsFunction<DispatchProps,OwnProps>} */
function mapDispatch(dispatch) {
  return {
    setDatasetHandler(evt) {
      const cubeName = evt.target.value;
      dispatch(doUpdateDataset(cubeName));
    }
  };
}

export default connect(mapState, mapDispatch)(ControlSources);
