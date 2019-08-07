import {Button, Tooltip} from "@blueprintjs/core";
import React from "react";
import {connect} from "react-redux";

import "./Cart.css";

class Cart extends React.Component {
  constructor(props, ctx) {
    super(props);

    this.state = {
    };

  }

  initialize(props) {

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
        CART COMPONENT!
      </div>
    );
  }
}

Cart.contextTypes = {
};

Cart.childContextTypes = {
};

Cart.propTypes = {
};

Cart.defaultProps = {
};

export const defaultProps = Cart.defaultProps;
export default connect(state => {
  const ct = state.cart;
  return {

  };
})(Cart);
