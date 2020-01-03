import React from "react";
import PropTypes from "prop-types";
import DatasetListItem from "./DatasetListItem";

import "./DatasetList.css";

class DatasetList extends React.Component {
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
    const {showOptions} = this.props;
    const {datasets} = this.context;
    const datasetsIds = Object.keys(datasets).sort();

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
            <ul className="canon-cart-dataset-ul">
              <li className="bp3-menu-header"><h6 className="bp3-heading">Datasets: {datasetsIds.length}</h6></li>
              {datasetsIds.map((did, ix) =>
                <DatasetListItem key={ix} ix={`${ix + 1}`} dataset={datasets[did]} showOptions={showOptions} />
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
