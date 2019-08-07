import React from "react";
import PropTypes from "prop-types";
import {connect} from "react-redux";

import {Popover, PopoverInteractionKind, Classes, Button} from "@blueprintjs/core";

import "./NavCartControl.css";

class NavCartControl extends React.Component {
  constructor(props, ctx) {
    super(props);

    this.state = {
    };

    this.onClickClearCart = this.onClickClearCart.bind(this);
  }

  initialize(props) {

  }

  componentDidMount() {

  }

  componentDidUpdate(prevProps) {

  }

  componentWillUnmount() {

  }

  onClickClearCart() {
    console.log("onClickClearCart");
  }

  render() {
    const {cartRoute} = this.props;

    const buttonText = "Cart";

    const popoverContent =
      <div className={"canon-cart-nav-control-content"}>
        <h4>Data cart</h4>
        <div className={"canon-cart-nav-control-button-container"}>
          <a className={"bp3-button bp3-fill bp3-minimal canon-cart-nav-control-button"} href={cartRoute}>View Data</a>
          <Button onClick={this.onClickClearCart} fill={true} minimal={true}>Clear Data</Button>
        </div>
      </div>
    ;

    return (
      <Popover content={popoverContent} popoverClassName={`canon-cart-nav-control-popover ${Classes.POPOVER_CONTENT_SIZING} ${Classes.POPOVER_DISMISS}`} interactionKind={PopoverInteractionKind.HOVER}>
        <a href={cartRoute} className={"canon-cart-nav-control-container"}>
          {buttonText}
        </a>
      </Popover>
    );
  }
}

NavCartControl.contextTypes = {
};

NavCartControl.childContextTypes = {
};

NavCartControl.propTypes = {
  cartRoute: PropTypes.string
};

NavCartControl.defaultProps = {
  cartRoute: "/cart"
};

export const defaultProps = NavCartControl.defaultProps;
export default connect(state => {
  const ct = state.cart;
  return {

  };
})(NavCartControl);
