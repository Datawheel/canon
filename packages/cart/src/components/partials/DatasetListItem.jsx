import React from "react";
import PropTypes from "prop-types";
import {MenuItem, Icon, MenuDivider, Checkbox} from "@blueprintjs/core";

import {removeFromCartAction} from "../../actions";

import "./DatasetListItem.css";

class DatasetListItem extends React.Component {
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
    dispatch(removeFromCartAction(dataset.originalUrl));
  }

  render() {
    const {ix, dataset, showOptions} = this.props;

    return (
      <div className={"canon-cart-dataset-list-item"}>
        <MenuItem multiline={true} className={"canon-cart-dataset-item"} onClick={() => this.onClickRemoveDataset(dataset)} labelElement={<Icon icon="trash" />} text={`${ix + 1}. ${dataset.name}`} />
        {showOptions &&
          <div>
            <MenuItem multiline={true} disabled={dataset.query.params.cuts.length === 0} className={"canon-cart-dataset-item"} text={`Cuts (${dataset.query.params.cuts.length})`}>
              {dataset.query.params.cuts.map((c, ix) =>
                <Checkbox key={`cut-${ix}`} checked={true} label={`${c.dimension}.${c.level} = ${c.members.join(",")}`} />
              )}
            </MenuItem>
            <MenuItem multiline={true} disabled={dataset.query.params.drilldowns.length === 0} className={"canon-cart-dataset-item"} text={`Drilldowns (${dataset.query.params.drilldowns.length})`}>
              {dataset.query.params.drilldowns.map((c, ix) =>
                <Checkbox key={`cut-${ix}`} checked={true} label={`${c.dimension}.${c.level}`} />
              )}
            </MenuItem>
            <MenuDivider />
          </div>
        }
      </div>
    );
  }
}

DatasetListItem.contextTypes = {
  dispatch: PropTypes.func
};

DatasetListItem.propTypes = {
};

DatasetListItem.defaultProps = {
};

export const defaultProps = DatasetListItem.defaultProps;

export default DatasetListItem;
