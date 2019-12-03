import React from "react";
import {withNamespaces} from "react-i18next";
import {connect} from "react-redux";
import ConditionalAnchor from "../components/ConditionalAnchor";
import ControlArea from "../components/ControlArea";
import DatasetSelect from "../components/DatasetSelect";
import {doUpdateDataset} from "../middleware/actions";
import {
  selectCube,
  selectMeasure,
  selectMeasureListForTable
} from "../store/query/selectors";

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

/** @type {React.FC<import("react-i18next").WithNamespaces & OwnProps & StateProps & DispatchProps>} */
const ControlSources = function({cube, measure, setDatasetHandler, t, tableMeasures}) {
  if (!cube || !measure) {
    return null;
  }

  return (
    <div className="control sources">
      <h3 className="label">{t("Vizbuilder.title_source")}</h3>

      {cube.sourceName && (
        <p>
          <span>{t("Vizbuilder.prefix_source")}</span>
          <ConditionalAnchor className="source-link" href={cube.sourceHref}>
            {cube.sourceName}
          </ConditionalAnchor>
        </p>
      )}

      {cube.sourceDescription && <p>{cube.sourceDescription}</p>}

      {cube.datasetName && (
        <div>
          <span>{t("Vizbuilder.prefix_dataset")}</span>
          <DatasetSelect
            fill
            measure={measure}
            measures={tableMeasures}
            onChange={setDatasetHandler}
          />
        </div>
      )}
    </div>
  );
};

/** @type {import("react-redux").MapStateToProps<StateProps,OwnProps,GeneralState>} */
function mapState(state) {
  return {
    cube: selectCube(state),
    measure: selectMeasure(state),
    tableMeasures: selectMeasureListForTable(state)
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

export default withNamespaces()(connect(mapState, mapDispatch)(ControlSources));
