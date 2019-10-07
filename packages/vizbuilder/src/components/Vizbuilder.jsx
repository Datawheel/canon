import cn from "classnames";
import LoadingScreen from "components/Loading";
import React, {Component} from "react";
import {connect} from "react-redux";
import {doSetup} from "../actions/middleware";
import {selectMeasureList} from "../selectors/listsRaw";
import {selectLoadState} from "../selectors/state";
import ControlGroups from "./ControlGroups";
import ControlFilters from "./ControlFilters";
import ControlMeasure from "./ControlMeasure";
import Ranking from "./Ranking";
import ControlSources from "./ControlSources";

/**
 * @typedef OwnState
 * @property {boolean} isSidebarOpen
 */

/**
 * @typedef StateProps
 * @property {boolean} isLoading
 * @property {number} loadDone
 * @property {number} loadTotal
 * @property {MeasureItem[]} measures
 */

/**
 * @typedef DispatchProps
 * @property {() => any} setupParameters
 */

/**
 * @extends {Component<import("..").VizbuilderProps&StateProps&DispatchProps, OwnState>}
 */
class Vizbuilder extends Component {
  state = {
    isSidebarOpen: true
  };

  componentDidMount() {
    this.props.setupParameters();
  }

  render() {
    const {
      isLoading,
      loadDone,
      loadTotal,
      measures,
      formatting,
      titleArea,
      controlsArea,
      sourcesArea
    } = this.props;
    const {isSidebarOpen} = this.state;

    if (measures.length === 0) {
      return (
        <div className="vizbuilder fetching">
          <LoadingScreen progress={loadDone} total={loadTotal} />
        </div>
      );
    }

    return (
      <div className={cn("vizbuilder", {fetching: isLoading})}>
        {isLoading && <LoadingScreen progress={loadDone} total={loadTotal} />}

        <div className="area-sidebar" hidden={!isSidebarOpen}>
          <div className="wrapper">
            {titleArea}

            <ControlMeasure defaultTable={this.props.defaultTable} />

            <ControlGroups
              className="control groups-manager"
              labelActionAdd="Add group"
              labelActionApply="Apply"
              labelActionDelete="Delete"
              labelActionEdit="Edit"
              labelActionReset="Reset"
              labelTitle="Grouped by"
            />

            <ControlFilters
              className="control filters-manager"
              formatters={formatting}
              labelActionApply="Apply"
              labelActionDelete="Delete"
              labelActionEdit="Edit"
              labelActionReset="Reset"
              labelActionAdd="Add filter"
              labelTitle="Filtered by"
            />

            {controlsArea}

            <ControlSources />

            {sourcesArea}

            <Ranking />
          </div>
        </div>

        <div className="area-chart">
          <div className="wrapper" />
        </div>
      </div>
    );
  }
}

/** @type {import("react-redux").MapStateToProps<StateProps,import("..").VizbuilderProps,GeneralState>} */
function mapState(state) {
  const loading = selectLoadState(state);
  return {
    measures: selectMeasureList(state),
    isLoading: loading.inProgress,
    loadDone: loading.done,
    loadTotal: loading.total
  };
}

/** @type {import("react-redux").MapDispatchToPropsFunction<DispatchProps,import("..").VizbuilderProps>} */
function mapDispatch(dispatch, props) {
  return {
    setupParameters() {
      return dispatch(doSetup(props));
    }
  };
}

export default connect(mapState, mapDispatch)(Vizbuilder);
