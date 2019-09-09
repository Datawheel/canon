import React from "react";
import {connect} from "react-redux";
import PropTypes from "prop-types";
import {Tooltip, Button} from "@blueprintjs/core";

import {loadDatasetsAction, joinResultsAndShow} from "../../actions";

import DatasetList from "../partials/DatasetList";
import SettingsPanel from "./partials/SettingsPanel";
import ActionsPanel from "./partials/ActionsPanel";
import EmptyCartPanel from "./partials/EmptyCartPanel";
import LoadingPanel from "./partials/LoadingPanel";
import DimensionsPanel from "./partials/DimensionsPanel";

import Table from "./partials/Table";

import "./Cart.css";

class Cart extends React.Component {
  constructor(props, ctx) {
    super(props);
    this.state = {showSidebar: true};
    this.toggleSidebar = this.toggleSidebar.bind(this);
  }

  getChildContext() {
    const {datasets, dispatch, settings, controls, results} = this.props;
    return {
      datasets, dispatch, settings, controls, results
    };
  }

  toggleSidebar() {
    this.setState(
      state => ({showSidebar: !state.showSidebar}),
      () => window.dispatchEvent(new CustomEvent("resize"))
    );
  }

  componentDidMount() {
    this.loadAllDatasets(false);
  }

  componentDidUpdate(prevProps) {
    const readyAndLoaded = this.props.cartReady && !this.props.cartLoading;

    // Datasets changed
    const changedDatasets = Object.keys(prevProps.datasets).length !== Object.keys(this.props.datasets).length;
    if (changedDatasets) {
      this.loadAllDatasets(false);
    }

    if (readyAndLoaded) {
      // Dimensions
      const changedDims = prevProps.controls !== this.props.controls;
      if (changedSettings || changedDims) {
        this.loadAllDatasets(true);
      }

      // Settings
      const changedSettings = prevProps.settings !== this.props.settings;
      if (changedSettings) {
        this.processAllDatasets();
      }

    }
  }

  componentWillUnmount() {

  }

  loadAllDatasets(sendDimensions) {
    const {dispatch, datasets, settings} = this.props;
    const {selectedSharedDimensionLevel, selectedDateDimensionLevel} = this.props.controls;
    let dateLevel, sharedLevel;
    if (datasets && Object.keys(datasets).length > 0) {
      if (sendDimensions) {
        sharedLevel = selectedSharedDimensionLevel;
        dateLevel = selectedDateDimensionLevel;
      }
      dispatch(loadDatasetsAction(datasets, sharedLevel, dateLevel, settings));
    }
  }

  processAllDatasets() {
    const {dispatch, datasets, settings} = this.props;
    const {selectedSharedDimensionLevel, selectedDateDimensionLevel} = this.props.controls;
    const {responses} = this.props.results;
    let dateLevel, sharedLevel;
    if (datasets && Object.keys(datasets).length > 0) {
      sharedLevel = selectedSharedDimensionLevel;
      dateLevel = selectedDateDimensionLevel;
      dispatch(joinResultsAndShow(responses, sharedLevel, dateLevel, settings));
    }
  }

  render() {
    const {showSidebar} = this.state;
    const {datasets, cartReady, cartLoading} = this.props;
    const hiddenClass = showSidebar ? "" : "hidden";

    const emptyCart = Object.keys(datasets).length === 0;

    if (cartReady && emptyCart) {
      return <div className={"canon-cart-container"}>
        <EmptyCartPanel />
      </div>;
    }

    return (
      <div className={"canon-cart-container"}>
        <div className={`canon-cart-area-sidebar ${hiddenClass}`}>
          {!cartReady || cartLoading &&
            <div className="canon-cart-sidebar-blocker"/>
          }
          <div className="canon-cart-wrapper">
            <DatasetList />
            <hr />
            <DimensionsPanel />
            <hr />
            <SettingsPanel />
            <hr/>
            <ActionsPanel/>
          </div>
        </div>
        <div className="canon-cart-area-middle">
          <Tooltip
            className="toggle-sidebar"
            content={showSidebar ? "Hide Controls" : "Show Controls"}
            placement="auto"
          >
            <Button
              onClick={this.toggleSidebar}
              icon={showSidebar ? "menu-closed" : "menu-open"}
            />
          </Tooltip>
        </div>
        <div className="canon-cart-area-data">
          {cartReady && cartLoading &&
            <LoadingPanel />
          }
          {cartReady && !cartLoading &&
            <div className="canon-cart-wrapper">
              <Table />
            </div>
          }
        </div>
      </div>
    );
  }
}

Cart.contextTypes = {
};

Cart.childContextTypes = {
  datasets: PropTypes.object,
  controls: PropTypes.object,
  dispatch: PropTypes.func,
  settings: PropTypes.object,
  results: PropTypes.object
};

Cart.propTypes = {
};

Cart.defaultProps = {
};

export const defaultProps = Cart.defaultProps;
export default connect(state => {
  const ct = state.cart;
  return {
    datasets: ct.list,
    settings: ct.settings,
    controls: ct.controls,
    cartReady: ct.internal.ready,
    cartLoading: ct.internal.loading,
    results: ct.results
  };
})(Cart);
