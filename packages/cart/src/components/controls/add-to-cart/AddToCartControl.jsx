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

  initialize(props) {

  }

  componentDidMount() {

  }

  componentDidUpdate(prevProps) {

  }

  componentWillUnmount() {

  }

  onClickAddToCart() {
    const {query, datasets} = this.props;
    const hash = getHashCode(query);
    if (datasets[`${hash}`]) {
      this.props.dispatch(removeFromCartAction(hash));
    }
    else {
      this.props.dispatch(addToCartAction(query));
    }
  }

  render() {
    const {tooltip, query, datasets} = this.props;
    const hash = getHashCode(query);
    const canAdd = datasets[`${hash}`] ? false : true;

    const buttonText = canAdd ? "Add Data To Cart" : "Remove from Cart";
    const tooltipText = canAdd ? "Add the underlying data to the cart, and merge with the existing cart data" : "Remove this dataset from the cart";

    return <Tooltip
      className={`${Classes.TOOLTIP_INDICATOR  } canon-add-to-cart-control-tooltip`}
      content={tooltipText}
      disabled={!tooltip}
    >
      <div className={"canon-add-to-cart-control-container"} onClick={this.onClickAddToCart}>
        <span>{buttonText}</span>
      </div>
    </Tooltip>;
  }
}

AddToCartControl.contextTypes = {
};

AddToCartControl.childContextTypes = {
};

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
    datasets: ct.list
  };
})(AddToCartControl);
