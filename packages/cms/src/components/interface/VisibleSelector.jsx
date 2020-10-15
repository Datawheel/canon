import React, {Component, Fragment} from "react";
import Select from "../fields/Select";
import TextInput from "../fields/TextInput";
import {Popover, Icon, Intent} from "@blueprintjs/core";

import "./VisibleSelector.css";

class VisibleSelector extends Component {
  
  constructor(props) {
    super(props);
    this.state = {
      customVisible: false
    };
  }

  componentDidMount() {
    const customVisible = this.determineAllowed.bind(this)();
    this.setState({customVisible});
  }

  determineAllowed() {
    const variables = this.props.variables || {};
    return !Object.keys(variables).includes(this.props.value) && this.props.value !== "always";
  }

  toggleCustom(e) {
    // If the user has a custom entry, and is disabling custom mode, the ensuing dropdown needs
    // the default to be "always". Send this synthetic event so the drop-down is correctly set.
    if (!e.target.checked) {
      if (this.determineAllowed.bind(this)()) {
        this.props.onChange({target: {value: "always"}});
      }
    }
    this.setState({customVisible: e.target.checked});
  }

  render() {

    const {customVisible} = this.state;
    const {variables, value, hideCustom, type} = this.props;

    let varOptions = [<option key="always" value="always">Always</option>]
      .concat(Object.keys(variables)
        .filter(key => !key.startsWith("_"))
        .sort((a, b) => a.localeCompare(b))
        .map(key => {
          const value = variables[key];
          const type = typeof value;
          const label = !["string", "number", "boolean"].includes(type) ? ` <i>(${type})</i>` : `: ${`${value}`.slice(0, 20)}${`${value}`.length > 20 ? "..." : ""}`;
          return <option key={key} value={key} dangerouslySetInnerHTML={{__html: `${key}${label}`}}></option>;
        }));

    // If the parent component set hideCustom true, then this is a drop-down only, and can never have a customVisible.
    // If a hideCustom selector contains a variable not in the dropdown list, then this allowed was broken by someone
    // deleting a variable this depended on. Show a warning.
    const broken = this.determineAllowed.bind(this)();
    if (broken) {
      varOptions = [
        <option 
          key={value} 
          value={value}
        >
          {value}
        </option>
      ].concat(varOptions);
    }

    const showVars = Object.keys(variables).length > 0;

    const verb = type === "generator" ? "run" : "shown";

    return (
      <fieldset className="cms-visible-selector-fieldset cms-fieldset">

        {customVisible && !hideCustom
          ? <label>
            <TextInput
              className="cms-visible-selector-input"
              label={<Fragment>Enter a variable name, using <code className="u-font-xs">[[selectors]]</code> if desired.</Fragment>}
              namespace="cms"
              value={value}
              onChange={this.props.onChange}
            />
          </label>
          : showVars
            ? <div className="cms-visible-selector-group">
              <Select
                label="Visible"
                namespace="cms"
                value={value}
                onChange={this.props.onChange}
                inline
              >
                {varOptions}
              </Select>
              { broken && 
                <Popover>
                  <Icon className="cms-visible-icon" intent={Intent.WARNING} icon="error" />
                  <div className="cms-visible-popover">
                    <h3>Undefined Variable</h3>
                    <p dangerouslySetInnerHTML={{__html: `The <strong>allowed</strong> value for this ${type} is set to: <pre>${value}</pre> but that variable does not exist for this member.`}}></p>
                    <p dangerouslySetInnerHTML={{__html: `You may want to check if this is intended - This ${type} <strong>will not be ${verb}</strong> for this member.`}}></p>
                    <p><a target="_blank" rel="noreferrer" href="https://github.com/Datawheel/canon/blob/master/packages/cms/README.md#using-allowed">Read more...</a></p>
                  </div>
                </Popover>
              }
            </div> : ""
        }

        {!hideCustom && <label className="cms-visible-selector-checkbox-label cms-checkbox-label u-font-xs u-margin-bottom-off">
          <input
            className="cms-checkbox"
            type="checkbox"
            checked={customVisible}
            onChange={this.toggleCustom.bind(this)}
          /> Override visible property with custom variable
        </label> }
      </fieldset>
    );
  }

}

export default VisibleSelector;
