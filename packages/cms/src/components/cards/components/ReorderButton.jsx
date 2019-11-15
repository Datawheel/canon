import React, {Component} from "react";
import {connect} from "react-redux";
import {swapEntity} from "../../../actions/profiles.js";
import Button from "../../fields/Button";

import "./ReorderButton.css";

class ReorderButton extends Component {

  render() {

    const {id, type} = this.props;

    return (
      <div className="cms-reorder">
        <Button
          onClick={() => this.props.swapEntity(type, id)}
          className="cms-reorder-button"
          namespace="cms"
          icon="swap-vertical"
          iconOnly
        >
          Swap positioning of current and next cards
        </Button>
      </div>
    );
  }
}

const mapDispatchToProps = dispatch => ({
  swapEntity: (type, id) => dispatch(swapEntity(type, id))
});

export default connect(null, mapDispatchToProps)(ReorderButton);
