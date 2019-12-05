import React, {Component} from "react";
import Select from "../fields/Select";

class AllowedSelector extends Component {

  constructor(props) {
    super(props);
    this.state = {
      customAllowed: false
    };
  }

  componentDidMount() {
    const customAllowed = this.determineAllowed.bind(this)();
    this.setState({customAllowed});
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
    this.setState({customAllowed: e.target.checked});
  }

  render() {

    const {customAllowed} = this.state;
    const {variables, value} = this.props;

    const varOptions = [<option key="always" value="always">Always</option>]
      .concat(Object.keys(variables)
        .filter(key => !key.startsWith("_"))
        .sort((a, b) => a.localeCompare(b))
        .map(key => {
          const value = variables[key];
          const type = typeof value;
          const label = !["string", "number", "boolean"].includes(type) ? ` <i>(${type})</i>` : `: ${`${value}`.slice(0, 20)}${`${value}`.length > 20 ? "..." : ""}`;
          return <option key={key} value={key} dangerouslySetInnerHTML={{__html: `${key}${label}`}}></option>;
        }));

    const showVars = Object.keys(variables).length > 0;
  
    return (
      <React.Fragment>
        { customAllowed
          ? <label>
            Enter a variable name, using <code>[[selectors]]</code> if desired.<br/><br/>
            <code>{"{{"}</code><input type="text" value={value} onChange={this.props.onChange}/><code>{"}}"}</code><br/><br/>
          </label>
          : showVars
            ? <Select
              label="Visible"
              namespace="cms"
              value={value || "always"}
              onChange={this.props.onChange}
              inline
            >
              {varOptions}
            </Select>
            : null
        }
        <label>
          <input 
            type="checkbox" 
            checked={customAllowed} 
            onChange={this.toggleCustom.bind(this)} 
          /> Override Visible property with custom variable
        </label>
      </React.Fragment>
    );
  }

}

export default AllowedSelector;

