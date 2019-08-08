import {Button} from "@blueprintjs/core";
import React from "react";
import PropTypes from "prop-types";

import {removeFromCartAction} from "../../actions";

import "./DatasetList.css";

class DatasetList extends React.Component {
  constructor(props, ctx) {
    super(props);
    this.onClickRemoveDataset = this.onClickRemoveDataset.bind(this);
  }

  componentDidMount() {

  }

  componentDidUpdate(prevProps) {

  }

  componentWillUnmount() {

  }

  onClickRemoveDataset(datasetId) {
    const {dispatch} = this.context;
    dispatch(removeFromCartAction(datasetId));
  }

  render() {
    const {datasets} = this.context;
    const datasetsIds = Object.keys(datasets);

    return (
      <div className={"canon-cart-dataset-list"}>
        <h3>Data cart</h3>
        <p>Datasets: {datasetsIds.length}</p>
        {datasetsIds.map(did => <div className="canon-cart-dataset-item" key={datasets[did].id}>
          <span>{datasets[did].name}</span>
          <Button onClick={() => this.onClickRemoveDataset(did)}>x</Button>
        </div>)}
      </div>
    );
  }
}

DatasetList.contextTypes = {
  datasets: PropTypes.object,
  dispatch: PropTypes.func
};

DatasetList.propTypes = {
};

DatasetList.defaultProps = {
};

export const defaultProps = DatasetList.defaultProps;

export default DatasetList;
