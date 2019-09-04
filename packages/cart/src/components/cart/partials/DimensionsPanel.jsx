import React from "react";
import PropTypes from "prop-types";

import {Icon, PopoverInteractionKind, Popover, Position, Menu, MenuItem, Button, Label} from "@blueprintjs/core";

import {getLevelDimension} from "../../../helpers/transformations";

import {sharedDimensionLevelChangedAction, dateDimensionLevelChangedAction} from "../../../actions";

import "./DimensionsPanel.css";

class DimensionsPanel extends React.Component {
  constructor(props, ctx) {
    super(props);
    this.onChangeSharedDimension = this.onChangeSharedDimension.bind(this);
    this.onChangeDateDimension = this.onChangeDateDimension.bind(this);
    this.sharedDimItemRenderer = this.sharedDimItemRenderer.bind(this);
    this.dateDimItemRenderer = this.dateDimItemRenderer.bind(this);
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
  // onClick={() => this.onChangeSharedDimension(dim.name)}
  sharedDimItemRenderer(sDims) {
    return (
      <Menu>
        {sDims.map(dim => <MenuItem key={`d-${dim.name}`} text={dim.name}>
          {dim.hierarchies.map(h => <MenuItem key={`h-${h.name}`} text={h.name}>
            {h && h.levels.map(level => <MenuItem key={`l-${level.name}`} text={level.name} onClick={() => this.onChangeSharedDimension(level)} />)}
          </MenuItem>)}
        </MenuItem>)}
      </Menu>
    );
  }

  dateDimItemRenderer(sDims) {
    return (
      <Menu>
        {sDims.map(dim => <MenuItem key={`d-${dim.name}`} text={dim.name}>
          {dim.hierarchies.map(h => <MenuItem key={`h-${h.name}`} text={h.name}>
            {h && h.levels.map(level => <MenuItem key={`l-${level.name}`} text={level.name} onClick={() => this.onChangeDateDimension(level)} />)}
          </MenuItem>)}
        </MenuItem>)}
      </Menu>
    );
  }

  renderLabel(level) {
    return <span>{level.dimension}  <Icon icon="caret-right"/>  {level.level}</span>;
  }

  render() {
    const {controls, datasets} = this.context;
    const emptyCart = Object.keys(datasets).length === 0;

    return (
      <div className={"canon-cart-dimensions-panel"}>

        {controls.selectedSharedDimensionLevel &&
          <Label>
            Shared dimensions
            <Popover
              content={this.sharedDimItemRenderer(controls.sharedDimensions)}
              interactionKind={PopoverInteractionKind.CLICK}
              fill={true}
              position={Position.BOTTOM}
              autoFocus={false}>
              <Button
                icon="layers"
                rightIcon="caret-down"
                fill={true}
                text={this.renderLabel(controls.selectedSharedDimensionLevel)}
              />
            </Popover>
          </Label>
        }

        {controls.selectedDateDimensionLevel &&
          <Label>
            Date dimensions
            <Popover
              content={this.dateDimItemRenderer(controls.dateDimensions)}
              interactionKind={PopoverInteractionKind.CLICK}
              fill={true}
              position={Position.BOTTOM}
              autoFocus={false}>
              <Button
                icon="calendar"
                rightIcon="caret-down"
                fill={true}
                text={this.renderLabel(controls.selectedDateDimensionLevel)}
              />
            </Popover>
          </Label>
        }

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

