import React from "react";
import PropTypes from "prop-types";
import {Button} from "@blueprintjs/core";

import {clearCartAction} from "../../../actions";


import "./ActionsPanel.css";

class ActionsPanel extends React.Component {
  constructor(props, ctx) {
    super(props);
    this.onClickClearCart = this.onClickClearCart.bind(this);
    this.onClickDownloadData = this.onClickDownloadData.bind(this);
  }

  componentDidMount() {

  }

  componentDidUpdate(prevProps) {

  }

  componentWillUnmount() {

  }

  onClickClearCart() {
    this.context.dispatch(clearCartAction());
  }

  onClickDownloadData() {
    console.log("TODO: download data");
  }

  render() {

    return (
      <div className={"canon-cart-actions-panel"}>
        <Button onClick={this.onClickDownloadData} fill={true} minimal={true}>Download Data</Button>
        <Button onClick={this.onClickClearCart} fill={true} minimal={true}>Clear Data</Button>
      </div>
    );
  }
}

ActionsPanel.contextTypes = {
  datasets: PropTypes.object,
  dispatch: PropTypes.func
};

ActionsPanel.propTypes = {
};

ActionsPanel.defaultProps = {
};

export const defaultProps = ActionsPanel.defaultProps;
export default ActionsPanel;
