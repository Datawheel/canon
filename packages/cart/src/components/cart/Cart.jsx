import React from "react";
import {connect} from "react-redux";
import PropTypes from "prop-types";

import DatasetList from "../partials/DatasetList";
import SettingsPanel from "./partials/SettingsPanel";
import ActionsPanel from "./partials/ActionsPanel";

import "./Cart.css";

class Cart extends React.Component {
  constructor(props, ctx) {
    super(props);
  }

  getChildContext() {
    const {datasets, dispatch, settings} = this.props;
    return {
      datasets, dispatch, settings
    };
  }

  componentDidMount() {

  }

  componentDidUpdate(prevProps) {

  }

  componentWillUnmount() {

  }

  render() {

    return (
      <div className={"canon-cart-container"}>
        <DatasetList />
        <hr />
        <SettingsPanel />
        <hr/>
        <ActionsPanel/>
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
