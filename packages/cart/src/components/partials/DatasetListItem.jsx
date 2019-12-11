import React from "react";
import PropTypes from "prop-types";
import {MenuItem, Icon, MenuDivider, Checkbox, Tooltip, Classes, Position} from "@blueprintjs/core";

import {removeFromCartAction, toggleCutAction, toggleDrilldownAction} from "../../actions";

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

  onChangeCut(datasetId, c) {
    this.context.dispatch(toggleCutAction(datasetId, c));
  }

  onChangeDrilldown(datasetId, d) {
    this.context.dispatch(toggleDrilldownAction(datasetId, d));
  }

  onClickRemoveDataset(dataset) {
    this.context.dispatch(removeFromCartAction(dataset.originalUrl));
  }

  render() {
    const {ix, dataset, showOptions} = this.props;

    return (
      <div className={"canon-cart-dataset-list-item"}>
        <Tooltip
          className={`canon-dataset-list-tooltip`}
          inline={true}
          position={showOptions?Position.RIGHT:Position.LEFT}
          content={"Click for remove dataset from Cart"}
        >
          <MenuItem multiline={true} className={"canon-cart-dataset-item"} onClick={() => this.onClickRemoveDataset(dataset)} labelElement={<Icon icon="trash" />} text={`${ix + 1}. ${dataset.name}`} />
        </Tooltip>
        {showOptions &&
          <div>
            {dataset.query.params.cuts.length > 0 &&
              <MenuItem icon="filter" multiline={true} className={"canon-cart-dataset-item"} text={`Filter by`}>
                <li className="bp3-menu-header"><h6 className="bp3-heading">Filters</h6></li>
                {dataset.query.params.cuts.map((c, ix) =>
                  <MenuItem key={`cut-${ix}`} multiline={true} text={<Checkbox checked={c.selected} label={`${c.dimension}.${c.level} = ${c.members.join(",")}`} onChange={this.onChangeCut.bind(this, dataset.id, c)} />}></MenuItem>
                )}
              </MenuItem>
            }
            {dataset.query.params.drilldowns.length > 0 &&
              <MenuItem icon="group-objects" multiline={true} className={"canon-cart-dataset-item"} text={`Grouped by`}>
                <li className="bp3-menu-header"><h6 className="bp3-heading">Groups</h6></li>
                {dataset.query.params.drilldowns.map((d, ix) =>
                  <MenuItem key={`drilldown-${ix}`} multiline={true} text={<Checkbox checked={d.selected} disabled={!d.available} label={`${d.dimension}.${d.level}`} onChange={this.onChangeDrilldown.bind(this, dataset.id, d)} />}></MenuItem>
                )}
              </MenuItem>
            }
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
