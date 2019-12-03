import {Checkbox} from "@blueprintjs/core";
import React from "react";
import {withNamespaces} from "react-i18next";
import {connect} from "react-redux";
import MeasureSelect from "../components/AllMeasureSelect";
import ControlArea from "../components/ControlArea";
import {doRunQueryCore, doUpdateMeasure} from "../middleware/actions";
import {selectMeasureList, selectMeasureMapByTable} from "../store/cubes/selectors";
import {doConfIntToggle} from "../store/query/actions";
import {
  selectLCIMeasureForCube,
  selectMeasure,
  selectMOEMeasureForCube,
  selectShowConfInt,
  selectUCIMeasureForCube
} from "../store/query/selectors";

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

/** @type {React.FC<import("react-i18next").WithNamespaces & OwnProps & StateProps & DispatchProps>} */
const ControlMeasure = function({
  hasConfInt,
  measure,
  measureList,
  measureMap,
  setMeasureHandler,
  showConfidenceInt,
  t,
  toggleConfIntHandler
}) {
  if (!measure) {
    return null;
  }

  return (
    <div className="control measure-manager">
      <h3 className="label">{t("Vizbuilder.title_measure")}</h3>
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
          label={t("Vizbuilder.action_togglemoe")}
          onChange={toggleConfIntHandler}
        />
      </p>
    </div>
  );
};

/** @type {import("react-redux").MapStateToProps<StateProps, OwnProps, GeneralState>} */
function mapState(state) {
  return {
    hasConfInt: Boolean(
      selectMOEMeasureForCube(state) ||
        selectUCIMeasureForCube(state) ||
        selectLCIMeasureForCube(state)
    ),
    measure: selectMeasure(state) || null,
    measureList: selectMeasureList(state),
    measureMap: selectMeasureMapByTable(state),
    showConfidenceInt: selectShowConfInt(state)
  };
}

/** @type {import("react-redux").MapDispatchToPropsFunction<DispatchProps,OwnProps>} */
function mapDispatch(dispatch, props) {
  return {
    setMeasureHandler(measure) {
      dispatch(doUpdateMeasure({measure, defaultTable: props.defaultTable}));
      dispatch(doRunQueryCore());
    },

    toggleConfIntHandler(evt) {
      dispatch(doConfIntToggle(evt.target.checked));
      dispatch(doRunQueryCore());
    }
  };
}

export default withNamespaces()(connect(mapState, mapDispatch)(ControlMeasure));
