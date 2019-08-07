import {Button} from "@blueprintjs/core";
import React from "react";
import {connect} from "react-redux";

import {removeFromCartAction} from "../../actions";

import "./Cart.css";

class Cart extends React.Component {
  constructor(props, ctx) {
    super(props);

    this.state = {
    };
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

  onClickRemoveDataset(datasetId) {
    this.props.dispatch(removeFromCartAction(datasetId));
  }

  render() {
    const {datasets} = this.props;

    const datasetsIds = Object.keys(datasets);

    return (
      <div className={"canon-cart-container"}>
        <h3>Datasets: {datasetsIds.length}</h3>
        {datasetsIds.map(did => <a className="canon-cart-dataset-item" key={datasets[did].id}>
          <span>{datasets[did].name}</span>
          <Button onClick={() => this.onClickRemoveDataset(did)}>x</Button>
        </a>)}
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
    datasets: ct.list
  };
})(Cart);
