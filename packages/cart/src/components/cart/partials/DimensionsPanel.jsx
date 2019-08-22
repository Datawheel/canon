import React from "react";
import PropTypes from "prop-types";

import {Select} from "@blueprintjs/select";
import {MenuItem, Button, Label} from "@blueprintjs/core";

import {sharedDimensionChangedAction, dateDimensionChangedAction} from "../../../actions";

import "./DimensionsPanel.css";

class DimensionsPanel extends React.Component {
  constructor(props, ctx) {
    super(props);
    this.onChangeSharedDimension = this.onChangeSharedDimension.bind(this);
    this.onChangeDateDimension = this.onChangeDateDimension.bind(this);
    this.sharedDimItemRenderer = this.sharedDimItemRenderer.bind(this);
    this.dateDimItemRenderer = this.dateDimItemRenderer.bind(this);
  }

  componentDidMount() {

  }

  componentDidUpdate(prevProps) {

  }

  componentWillUnmount() {

  }

  onChangeSharedDimension(dimName) {
    this.context.dispatch(sharedDimensionChangedAction(dimName));
  }

  onChangeDateDimension(dimName) {
    this.context.dispatch(dateDimensionChangedAction(dimName));
  }

  sharedDimItemRenderer(dim) {
    return (
      <MenuItem
        key={dim.name}
        text={dim.name}
        onClick={() => this.onChangeSharedDimension(dim.name)}
      />
    );
  }

  dateDimItemRenderer(dim) {
    return (
      <MenuItem
        key={dim.name}
        text={dim.name}
        onClick={() => this.onChangeDateDimension(dim.name)}
      />
    );
  }

  render() {
    const {controls, datasets} = this.context;
    const emptyCart = Object.keys(datasets).length === 0;

    /**         {Object.keys(settings).map(key =>
          <div key={key}>
            <Checkbox checked={settings[key].value} label={settings[key].label} disabled={emptyCart} onChange={this.onChangeSetting.bind(this, key)} />
          </div>
        )}
 */

    return (
      <div className={"canon-cart-dimensions-panel"}>

        <Label htmlFor="shared-dimensions" className={"bp3-inline"}>
          Shared dimensions
          <Select
            id={"shared-dimensions"}
            items={controls.sharedDimensions}
            itemRenderer={this.sharedDimItemRenderer}
            onItemSelect={this.onChangeSharedDimension}
            popoverProps={{minimal: true}}
            filterable={false}>
            <Button
              icon="layers"
              rightIcon="caret-down"
              fill={true}
              text={controls.selectedSharedDimensionId}
            />
          </Select>
        </Label>

        <Label htmlFor="date-dimensions" className={"bp3-inline"}>
          Date dimensions
          <Select
            id={"date-dimensions"}
            items={controls.dateDimensions}
            itemRenderer={this.dateDimItemRenderer}
            onItemSelect={this.onChangeDateDimension}
            popoverProps={{minimal: true}}
            filterable={false}>
            <Button
              icon="calendar"
              rightIcon="caret-down"
              fill={true}
              text={controls.selectedDateDimensionId}
            />
          </Select>
        </Label>
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

