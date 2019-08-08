import React from "react";
import PropTypes from "prop-types";

import {NonIdealState} from "@blueprintjs/core";

import "./EmptyCartPanel.css";

class EmptyCartPanel extends React.Component {
  constructor(props, ctx) {
    super(props);
  }

  componentDidMount() {

  }

  componentDidUpdate(prevProps) {

  }

  componentWillUnmount() {

  }

  render() {
    return (
      <NonIdealState className={"canon-cart-empty-panel"} icon="shopping-cart" title="Empty Cart" description="Navigate over the site and add some to cart" action={<p>Action</p>} />
    );
  }
}

EmptyCartPanel.contextTypes = {
  datasets: PropTypes.object,
  dispatch: PropTypes.func
};

EmptyCartPanel.propTypes = {
};

EmptyCartPanel.defaultProps = {
};

export const defaultProps = EmptyCartPanel.defaultProps;
export default EmptyCartPanel;
