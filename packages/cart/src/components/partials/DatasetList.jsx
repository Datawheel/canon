import React from "react";
import PropTypes from "prop-types";
import {MenuItem, Icon} from "@blueprintjs/core";

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

  onClickRemoveDataset(dataset) {
    const {dispatch} = this.context;
    dispatch(removeFromCartAction(dataset.url));
  }

  render() {
    const {datasets} = this.context;
    const datasetsIds = Object.keys(datasets);

    return (
      <div className={"canon-cart-dataset-list"}>
        <h3>Data cart</h3>
        {datasetsIds.length === 0 &&
          <div>
            <p>No datasets loaded</p>
          </div>
        }
        {datasetsIds.length > 0 &&
          <div>
            <p>Datasets: {datasetsIds.length}</p>
            <ul className="canon-cart-dataset-ul">
              {datasetsIds.map(did =>
                <MenuItem multiline={true} className={"canon-cart-dataset-item"} onClick={() => this.onClickRemoveDataset(datasets[did])} key={datasets[did].id} labelElement={<Icon icon="trash" />} text={datasets[did].name} />
              )}
            </ul>
          </div>
        }
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
