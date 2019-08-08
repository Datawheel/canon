import React from "react";
import PropTypes from "prop-types";
import {connect} from "react-redux";
import {Classes, Tooltip} from "@blueprintjs/core";
import {getHashCode} from "../../../helpers/transformations";

import {addToCartAction, removeFromCartAction} from "../../../actions";

import "./AddToCartControl.css";

class AddToCartControl extends React.Component {
  constructor(props, ctx) {
    super(props);

    this.state = {

    };

    this.onClickAddToCart = this.onClickAddToCart.bind(this);

  }

  componentDidMount() {

  }

  componentDidUpdate(prevProps) {

  }

  componentWillUnmount() {

  }

  onClickAddToCart() {
    const {query, datasets, cartIsFull, dispatch} = this.props;
    const hash = getHashCode(query);
    if (datasets[`${hash}`]) {
      dispatch(removeFromCartAction(hash));
    }
    else {
      if (!cartIsFull) {
        dispatch(addToCartAction(query));
      }
    }
  }

  render() {
    const {tooltip, query, datasets, cartIsReady, cartIsFull} = this.props;
    const hash = getHashCode(query);
    const canAdd = datasets[`${hash}`] ? false : true;
    const readyClass = cartIsReady ? "ready" : "no-ready";
    let stateClass = canAdd ? "add-state" : "remove-state";
    stateClass = cartIsFull && canAdd ? "full-state add-state" : stateClass;

    const buttonText = canAdd ? "Add Data To Cart" : "Remove from Cart";
    let tooltipText = canAdd ? "Add the underlying data to the cart, and merge with the existing cart data" : "Remove this dataset from the cart";
    tooltipText = cartIsFull && canAdd ? "Cart limit has been reached. Please visit the cart page to download the current cart and/or remove data." : tooltipText;
    return <Tooltip
      className={`${Classes.TOOLTIP_INDICATOR  } canon-add-to-cart-control-tooltip`}
      content={tooltipText}
      disabled={!tooltip && cartIsReady}
    >
      <div className={`canon-add-to-cart-control-container ${readyClass} ${stateClass}`} onClick={this.onClickAddToCart}>
        <span>{buttonText}</span>
      </div>
    </Tooltip>;
  }
}

AddToCartControl.propTypes = {
  query: PropTypes.string,
  tooltip: PropTypes.bool
};

AddToCartControl.defaultProps = {
  query: "",
  tooltip: true
};

export const defaultProps = AddToCartControl.defaultProps;
export default connect(state => {
  const ct = state.cart;
  return {
    datasets: ct.list,
    cartIsReady: ct.internal.ready,
    cartIsFull: ct.internal.full
  };
})(AddToCartControl);
