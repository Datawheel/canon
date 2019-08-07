import React from "react";
import PropTypes from "prop-types";
import {connect} from "react-redux";

import {clearCartAction, removeFromCartAction} from "../../../actions";

import {Popover, PopoverInteractionKind, Classes, Button} from "@blueprintjs/core";

import "./NavCartControl.css";

class NavCartControl extends React.Component {
  constructor(props, ctx) {
    super(props);

    this.state = {
    };

    this.onClickClearCart = this.onClickClearCart.bind(this);
    this.onClickRemoveDataset = this.onClickRemoveDataset.bind(this);
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
    this.props.dispatch(clearCartAction());
  }

  onClickRemoveDataset(datasetId) {
    this.props.dispatch(removeFromCartAction(datasetId));
  }

  render() {
    const {cartRoute, popover, datasets} = this.props;

    const buttonText = "Cart";
    const datasetsIds = Object.keys(datasets);
    const qty = datasetsIds.length;

    const popoverContent =
      <div className={"canon-cart-nav-control-content"}>
        <h4>Data cart</h4>
        <div className={"canon-cart-nav-control-dataset-container"}>
          {datasetsIds.map(did => <a className="canon-cart-nav-control-dataset-item" key={datasets[did].id}>
            <span>{datasets[did].name}</span>
            <span onClick={() => this.onClickRemoveDataset(did)}>x</span>
          </a>)}
        </div>
        <div className={"canon-cart-nav-control-button-container"}>
          <a className={"bp3-button bp3-fill bp3-minimal canon-cart-nav-control-button"} href={cartRoute}>View Data</a>
          <Button onClick={this.onClickClearCart} fill={true} minimal={true}>Clear Data</Button>
        </div>
      </div>
    ;

    return (
      <Popover content={popoverContent} disabled={!popover} popoverClassName={`canon-cart-nav-control-popover ${Classes.POPOVER_CONTENT_SIZING} ${Classes.POPOVER_DISMISS}`} interactionKind={PopoverInteractionKind.HOVER}>
        <a href={cartRoute} className={"canon-cart-nav-control-container"}>
          {qty > 0 && <span className={"canon-cart-nav-control-qty"}>({qty})</span>}
          <span className={"canon-cart-nav-control-text"}>{buttonText}</span>
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
  cartRoute: PropTypes.string,
  popover: PropTypes.bool
};

NavCartControl.defaultProps = {
  cartRoute: "/cart",
  popover: true
};

export const defaultProps = NavCartControl.defaultProps;
export default connect(state => {
  const ct = state.cart;
  return {
    datasets: ct.list
  };
})(NavCartControl);
