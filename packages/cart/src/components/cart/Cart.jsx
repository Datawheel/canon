import React from "react";
import {connect} from "react-redux";
import PropTypes from "prop-types";
import {Tooltip, Button} from "@blueprintjs/core";

import DatasetList from "../partials/DatasetList";
import SettingsPanel from "./partials/SettingsPanel";
import ActionsPanel from "./partials/ActionsPanel";
import Table from "./partials/Table";

import "./Cart.css";

class Cart extends React.Component {
  constructor(props, ctx) {
    super(props);
    this.state = {showSidebar: true};
    this.toggleSidebar = this.toggleSidebar.bind(this);
  }

  getChildContext() {
    const {datasets, dispatch, settings} = this.props;
    return {
      datasets, dispatch, settings
    };
  }

  toggleSidebar() {
    this.setState(
      state => ({showSidebar: !state.showSidebar}),
      () => window.dispatchEvent(new CustomEvent("resize"))
    );
  }

  componentDidMount() {

  }

  componentDidUpdate(prevProps) {

  }

  componentWillUnmount() {

  }

  render() {
    const {showSidebar} = this.state;
    const hiddenClass = showSidebar ? "" : "hidden";

    return (
      <div className={"canon-cart-container"}>
        <div className={`canon-cart-area-sidebar ${hiddenClass}`}>
          <div className="canon-cart-wrapper">
            <DatasetList />
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
          <div className="canon-cart-wrapper">
            <Table />
          </div>
        </div>
      </div>
    );
  }
}

Cart.contextTypes = {
};

Cart.childContextTypes = {
  datasets: PropTypes.object,
  dispatch: PropTypes.func,
  settings: PropTypes.object
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
    settings: ct.settings
  };
})(Cart);
