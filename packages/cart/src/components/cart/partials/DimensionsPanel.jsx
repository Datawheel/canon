import React from "react";
import PropTypes from "prop-types";

import {Icon, PopoverInteractionKind, Popover, Position, Menu, MenuItem, Button, Label, MenuDivider} from "@blueprintjs/core";

import {getLevelDimension} from "../../../helpers/transformations";

import {sharedDimensionLevelChangedAction, dateDimensionLevelChangedAction} from "../../../actions";

import "./DimensionsPanel.css";

class DimensionsPanel extends React.Component {
  constructor(props, ctx) {
    super(props);
    this.onChangeSharedDimension = this.onChangeSharedDimension.bind(this);
    this.onChangeDateDimension = this.onChangeDateDimension.bind(this);
    this.sharedDimItemRenderer = this.sharedDimItemRenderer.bind(this);
    this.renderLabel = this.renderLabel.bind(this);
  }

  componentDidMount() {

  }

  componentDidUpdate(prevProps) {

  }

  componentWillUnmount() {

  }

  onChangeSharedDimension(level) {
    this.context.dispatch(sharedDimensionLevelChangedAction(getLevelDimension(level)));
  }

  onChangeDateDimension(level) {
    this.context.dispatch(dateDimensionLevelChangedAction(getLevelDimension(level)));
  }

  sharedDimItemRenderer(sDims, isDate) {
    const {controls} = this.context;
    let selected = false;
    if(isDate && controls.selectedSharedDimensionLevel){
        selected = controls.selectedDateDimensionLevel;
    } else {
      if (controls.selectedSharedDimensionLevel) {
        selected = controls.selectedSharedDimensionLevel;
      }
    }
    return (
      <div>
        {sDims.map(dim => <MenuItem key={`d-${dim.name}`} text={dim.name}>
          {dim.hierarchies.map(h => <MenuItem key={`h-${h.name}`} text={h.name}>
            {h && h.levels.map(level => <MenuItem key={`l-${level.name}`} text={level.name} disabled={selected && selected.dimension === dim.name && selected.level === level.name} onClick={() => this.onChangeSharedDimension(level)} />)}
          </MenuItem>)}
        </MenuItem>)}
      </div>
    );
  }

  renderLabel(level) {
    return <span>{level.dimension}  <Icon icon="caret-right"/>  {level.level}</span>;
  }

  render() {
    const {controls} = this.context;

    return (
      <div className={"canon-cart-dimensions-panel"}>
        <Menu className="canon-cart-dimensions-ul">
          {controls.selectedSharedDimensionLevel &&
            <div>
              <li className="bp3-menu-header"><h6 className="bp3-heading">Shared dimensions</h6></li>
              <MenuItem icon="layers" text={this.renderLabel(controls.selectedSharedDimensionLevel)}>
                {this.sharedDimItemRenderer(controls.sharedDimensions, false)}
              </MenuItem>
            </div>
          }
        </Menu>
        <hr />
        <Menu className="canon-cart-dimensions-ul">
          {controls.selectedDateDimensionLevel &&
            <div>
              <li className="bp3-menu-header"><h6 className="bp3-heading">Date/Time dimensions</h6></li>
              <MenuItem icon="calendar" text={this.renderLabel(controls.selectedDateDimensionLevel)}>
                {this.sharedDimItemRenderer(controls.dateDimensions, true)}
              </MenuItem>
            </div>
          }
        </Menu>
      </div>
    );
  }
}

DimensionsPanel.contextTypes = {
  dispatch: PropTypes.func,
  controls: PropTypes.object,
  datasets: PropTypes.object
};

DimensionsPanel.propTypes = {
};

DimensionsPanel.defaultProps = {
};

export const defaultProps = DimensionsPanel.defaultProps;
export default DimensionsPanel;

