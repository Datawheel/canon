import React from "react";
import PropTypes from "prop-types";
import {Checkbox} from "@blueprintjs/core";

import {toggleSettingAction} from "../../../actions";


import "./SettingsPanel.css";

class SettingsPanel extends React.Component {
  constructor(props, ctx) {
    super(props);
  }

  componentDidMount() {

  }

  componentDidUpdate(prevProps) {

  }

  componentWillUnmount() {

  }

  onChangeSetting(settingId) {
    this.context.dispatch(toggleSettingAction(settingId));
  }

  render() {
    const {settings, datasets} = this.context;
    const emptyCart = Object.keys(datasets).length === 0;

    return (
      <div className={"canon-cart-settings-panel"}>
        {Object.keys(settings).map(key =>
          <div key={key}>
            <Checkbox checked={settings[key].value} label={settings[key].label} disabled={emptyCart} onChange={this.onChangeSetting.bind(this, key)} />
          </div>
        )}
      </div>
    );
  }
}

SettingsPanel.contextTypes = {
  dispatch: PropTypes.func,
  settings: PropTypes.object,
  datasets: PropTypes.object
};

SettingsPanel.propTypes = {
};

SettingsPanel.defaultProps = {
};

export const defaultProps = SettingsPanel.defaultProps;
export default SettingsPanel;
