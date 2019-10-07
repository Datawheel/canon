import React from "react";
import {connect} from "react-redux";
import {Checkbox} from "@blueprintjs/core";
import {doUpdateMeasure} from "../actions/middleware";
import {doConfIntToggle} from "../actions/query";
import MeasureSelect from "./AllMeasureSelect";
import translate from "../translate";
import {selectMeasure, selectShowConfInt} from "../selectors/queryRaw";
import {selectMeasureMOE, selectMeasureLCI, selectMeasureUCI} from "../selectors/queryDerived";
import {selectMeasureList} from "../selectors/listsRaw";
import {selectMeasureMapByTable} from "../selectors/listsDerived";

/**
 * @typedef OwnProps
 * @property {((cubes: CubeItem[]) => CubeItem) | undefined} defaultTable
 */

/**
 * @typedef StateProps
 * @property {boolean} hasConfInt
 * @property {MeasureItem?} measure
 * @property {MeasureItem[]} measureList
 * @property {{[tableId: string]: MeasureItem[]}} measureMap
 * @property {boolean} showConfidenceInt
 */

/**
 * @typedef DispatchProps
 * @property {(measure: MeasureItem) => any} setMeasureHandler
 * @property {(evt: React.ChangeEvent<HTMLInputElement>) => any} toggleConfIntHandler
 */

/** @type {React.FC<OwnProps&StateProps&DispatchProps>} */
const ControlMeasure = function({
  hasConfInt,
  measure,
  measureList,
  measureMap,
  setMeasureHandler,
  showConfidenceInt,
  toggleConfIntHandler
}) {
  if (!measure) {
    return null;
  }

  return (
    <fieldset className="control measure-manager">
      <legend className="label">Showing</legend>
      <MeasureSelect
        className="select-measure"
        onItemSelect={setMeasureHandler}
        selectedItem={measure}
        itemMap={measureMap}
        items={measureList}
      />
      <p className="details">{measure.details}</p>
      <p className="show-ci" hidden={!hasConfInt}>
        <Checkbox
          checked={showConfidenceInt}
          label={translate("Calculate Margins of Error")}
          onChange={toggleConfIntHandler}
        />
      </p>
    </fieldset>
  );
};

/** @type {import("react-redux").MapStateToProps<StateProps, OwnProps, GeneralState>} */
function mapState(state) {
  return {
    hasConfInt: Boolean(selectMeasureMOE(state) || selectMeasureLCI(state) || selectMeasureUCI(state)),
    measure: selectMeasure(state) || null,
    measureList: selectMeasureList(state),
    measureMap: selectMeasureMapByTable(state),
    showConfidenceInt: selectShowConfInt(state),
  };
}

/** @type {import("react-redux").MapDispatchToPropsFunction<DispatchProps,OwnProps>} */
function mapDispatch(dispatch, props) {
  return {
    setMeasureHandler(measure) {
      dispatch(doUpdateMeasure({measure, defaultTable: props.defaultTable}));
    },

    toggleConfIntHandler(evt) {
      dispatch(doConfIntToggle(evt.target.checked));
    }
  };
}

export default connect(mapState, mapDispatch)(ControlMeasure);
