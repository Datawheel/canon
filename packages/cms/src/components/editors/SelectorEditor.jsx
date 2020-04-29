import React, {Component, Fragment} from "react";
import Button from "../fields/Button";
import Select from "../fields/Select";
import TextInput from "../fields/TextInput";
import ButtonGroup from "../fields/ButtonGroup";
import {connect} from "react-redux";
import "./SelectorEditor.css";

class SelectorEditor extends Component {

  constructor(props) {
    super(props);
    this.state = {
      data: null
    };
  }

  componentDidMount() {
    const {data} = this.props;
    const showCustom = data.default.includes("{{");
    this.setState({data, showCustom});
  }

  addOption() {
    const {data, isDirty} = this.state;
    const {localeDefault} = this.props.status;
    const variables = this.props.status.variables[localeDefault];
    if (!data.options) data.options = [];
    const varList = Object.keys(variables).filter(v => !v.startsWith("_") && !data.options.map(o => o.option).includes(v));
    if (varList.length > 0) {
      data.options.push({option: varList[0], allowed: "always"});
    }
    else {
      data.options.push({option: "", allowed: "always"});
    }
    if (!isDirty) {
      if (this.props.markAsDirty) this.props.markAsDirty();
      this.setState({isDirty: true, data});
    }
    else {
      this.setState({data});
    }
  }

  chooseOption(index, e) {
    const {data, isDirty} = this.state;
    data.options[index].option = e.target.value;
    if (!isDirty) {
      if (this.props.markAsDirty) this.props.markAsDirty();
      this.setState({isDirty: true, data});
    }
    else {
      this.setState({data});
    }
  }

  chooseAllowed(index, e) {
    const {data, isDirty} = this.state;
    data.options[index].allowed = e.target.value;
    this.setState({data});
    if (!isDirty) {
      if (this.props.markAsDirty) this.props.markAsDirty();
      this.setState({isDirty: true, data});
    }
    else {
      this.setState({data});
    }
  }

  chooseCustom(e) {
    const {data, isDirty} = this.state;
    data.default = e.target.value;
    if (!isDirty) {
      if (this.props.markAsDirty) this.props.markAsDirty();
      this.setState({isDirty: true, data});
    }
    else {
      this.setState({data});
    }
  }

  chooseDynamic(e) {
    const {data, isDirty} = this.state;
    data.dynamic = e.target.value;
    if (!isDirty) {
      if (this.props.markAsDirty) this.props.markAsDirty();
      this.setState({data, isDirty: true});
    }
    else {
      this.setState({data});
    }
  }

  setDefault(option, e) {
    const {data, isDirty} = this.state;
    const {checked} = e.target;
    if (data.type === "single" && checked) {
      data.default = option;
    }
    else if (data.type === "multi") {
      const defaults = data.default.split(",");
      if (checked && !defaults.includes(option)) data.default = defaults.concat(option).join();
      if (!checked && defaults.includes(option)) data.default = defaults.filter(o => o !== option).join();
    }
    if (!isDirty) {
      if (this.props.markAsDirty) this.props.markAsDirty();
      this.setState({isDirty: true, showCustom: false, data});
    }
    else {
      this.setState({data, showCustom: false});
    }
  }

  deleteOption(i) {
    const {data, isDirty} = this.state;
    const option = data.options[i].option;
    data.options.splice(i, 1);
    // If the last default was deleted, make the first option the new default
    if (data.options.length > 0 && option === data.default) {
      data.default = data.options[0].option;
    }
    // The user may have deleted an option that was a default in a multiselect.
    // Recalculate the defaults so that it properly prunes them out.
    if (data.type === "multi") {
      const defaults = data.default.split(",");
      if (defaults.includes(option)) data.default = defaults.filter(o => o !== option).join();
    }
    if (!isDirty) {
      if (this.props.markAsDirty) this.props.markAsDirty();
      this.setState({isDirty: true, data});
    }
    else {
      this.setState({data});
    }
  }

  handleTypeChange(type) {
    const {data, isDirty} = this.state;
    data.type = type;
    if (data.type === "single") {
      const defaults = data.default.split(",");
      data.default = defaults.length > 0 ? defaults[0] : "";
    }
    if (!isDirty) {
      if (this.props.markAsDirty) this.props.markAsDirty();
      this.setState({isDirty: true, data});
    }
    else {
      this.setState({data});
    }
  }

  moveDown(i) {
    const {data, isDirty} = this.state;
    if (i === data.options.length - 1) {
      return;
    }
    else {
      const temp = data.options[i + 1];
      data.options[i + 1] = data.options[i];
      data.options[i] = temp;
    }
    if (!isDirty) {
      if (this.props.markAsDirty) this.props.markAsDirty();
      this.setState({isDirty: true, data});
    }
    else {
      this.setState({data});
    }
  }

  editName(e) {
    const {data, isDirty} = this.state;
    data.name = e.target.value;
    if (!isDirty) {
      if (this.props.markAsDirty) this.props.markAsDirty();
      this.setState({isDirty: true, data});
    }
    else {
      this.setState({data});
    }
  }

  validateDynamic(optionsArray) {
    const arrayExists = optionsArray && Array.isArray(optionsArray);
    if (!arrayExists) return "Error: Selected variable is not an array";
    const hasLength = optionsArray.length > 0;
    if (!hasLength) return "Error: Selected array has no length";
    const hasOptions = optionsArray.every(d => typeof d === "string" || (d && d.option));
    if (!hasOptions) return "Error: Objects in selected array are missing option keys";
    return "valid";
  }

  editLabel(e) {
    const {data, isDirty} = this.state;
    data.title = e.target.value;
    if (!isDirty) {
      if (this.props.markAsDirty) this.props.markAsDirty();
      this.setState({isDirty: true, data});
    }
    else {
      this.setState({data});
    }
  }

  toggleCustom() {
    this.setState({showCustom: !this.state.showCustom});
  }

  toggleDynamic() {
    const {data, isDirty} = this.state;
    const {localeDefault} = this.props.status;
    const variables = this.props.status.variables[localeDefault];
    const arrayOptions = Object.keys(variables).filter(key => Array.isArray(variables[key])).sort((a, b) => a.localeCompare(b));
    if (data.dynamic) {
      data.dynamic = "";
      data.default = "";
    }
    else {
      // Shouldn't be able to get here without arrayOptions having length (see render), so assume first element exists.
      data.default = "";
      data.dynamic = arrayOptions[0];
    }
    if (!isDirty) {
      if (this.props.markAsDirty) this.props.markAsDirty();
      this.setState({data, isDirty: true});    
    }
    else {
      this.setState({data});  
    }
  }


  render() {

    const {data, showCustom} = this.state;
    const {localeDefault} = this.props.status;
    const variables = this.props.status.variables[localeDefault];

    if (!data || !variables) return null;

    const makeLabel = (type, value) => !["string", "number", "boolean"].includes(type) ? ` <i>(${type})</i>` : `: ${`${value}`.slice(0, 20)}${`${value}`.length > 20 ? "..." : ""}`

    const varOptions = [<option key="always" value="always">Always</option>]
      .concat(Object.keys(variables)
        .filter(key => !key.startsWith("_"))
        .filter(key => typeof variables[key] !== "object")
        .sort((a, b) => a.localeCompare(b))
        .map(key => {
          const value = variables[key];
          const type = typeof value;
          const label = makeLabel(type, value);
          return <option key={key} value={key} dangerouslySetInnerHTML={{__html: `${key}${label}`}}></option>;
        }));

    const customOptions = Object.keys(variables)
      .filter(key => !key.startsWith("_"))
      .filter(key => typeof variables[key] !== "object")
      .sort((a, b) => a.localeCompare(b))
      .map(key => {
        const value = variables[key];
        const type = typeof value;
        const label = makeLabel(type, value);
        return <option key={`{{${key}}}`} value={`{{${key}}}`} dangerouslySetInnerHTML={{__html: `${key}${label}`}}></option>;
      });

    const arrayOptions = Object.keys(variables)
      .filter(key => Array.isArray(variables[key]))
      .sort((a, b) => a.localeCompare(b))
      .map(key => <option key={key} value={key}>{key}</option>);

    const buttonProps = {
      className: "u-font-xs",
      namespace: "cms",
      iconPosition: "left"
    };

    const dynamicStatus = this.validateDynamic(variables[data.dynamic]);
    const dynamicAndValid = data.dynamic && dynamicStatus === "valid";
    const dynamicAndBroken = data.dynamic && dynamicStatus !== "valid";

    let options = [];
    if (!data.dynamic) {
      options = data.options;
    }
    else if (dynamicAndValid) {
      options = variables[data.dynamic].map(d => {
        if (typeof d === "string") {
          return {option: d, allowed: "always", label: d};
        }
        else {
          return {allowed: "always", label: d.option, ...d};
        }
      });
    }

    console.log(data);

    return (
      <div className="cms-selector-editor">

        <div className="cms-field-group">
          <TextInput
            label="Selector name"
            namespace="cms"
            value={data.name}
            onChange={this.editName.bind(this)}
          />
          <TextInput
            label="Input label"
            namespace="cms"
            value={data.title}
            onChange={this.editLabel.bind(this)}
          />
        </div>

        {/* dynamic variable */}
        <label className={`cms-selector-editor-custom ${data.dynamic ? "is-visible" : "is-hidden"}`}>
          <input
            className="cms-selector-editor-custom-checkbox"
            type="checkbox"
            checked={data.dynamic}
            disabled={arrayOptions.length === 0}
            onChange={this.toggleDynamic.bind(this)}
          />
          {!data.dynamic
            ? "Use Dynamic Variable for options (advanced)"
            : <Fragment>Dynamic Variable: 
              <Select
                label=" "
                namespace="cms"
                value={data.dynamic}
                onChange={this.chooseDynamic.bind(this)}
                inline
              >
                {arrayOptions}
              </Select>
            </Fragment>
          }
        </label>

        <ButtonGroup className="cms-selector-editor-button-group" namespace="cms" buttons={[
          {
            children: "single selection",
            active: data.type === "single",
            onClick: this.handleTypeChange.bind(this, "single"),
            icon: "layer",
            ...buttonProps
          },
          {
            children: "multiple selections",
            active: data.type === "multi",
            onClick: this.handleTypeChange.bind(this, "multi"),
            icon: "layers",
            ...buttonProps
          }
        ]} />

        {dynamicAndBroken 
          ? <div className="cms-selector-status">{dynamicStatus}</div>
          : options.length > 0 
            ? <table className="cms-selector-editor-table">
              <thead className="cms-selector-editor-thead">
                <tr className="cms-selector-editor-row">
                  <td className="cms-selector-editor-cell">Default</td>
                  <td className="cms-selector-editor-cell">Option</td>
                  <td className="cms-selector-editor-cell">Visible</td>
                  <td className="cms-selector-editor-cell" colSpan="2">Actions</td>
                </tr>
              </thead>

              <tbody className="cms-selector-editor-tbody">
                {options.map((option, i) =>
                  <tr className="cms-selector-editor-row" key={i}>

                    {/* default */}
                    <td className="cms-selector-editor-cell">
                      <input
                        type={data.type === "multi" ? "checkbox" : "radio"}
                        checked={data.default.split(",").includes(option.option)}
                        onChange={this.setDefault.bind(this, option.option)}
                      /><span className="u-visually-hidden">default option</span>
                    </td>

                    {/* option */}
                    <td className="cms-selector-editor-cell">
                      {dynamicAndValid
                        ? <div>{`${option.option}${makeLabel(typeof option.option, option.label ? option.label : variables[option.option])}`}</div>
                        : <Select
                          label="option (new)"
                          labelHidden
                          namespace="cms"
                          value={option.option}
                          onChange={this.chooseOption.bind(this, i)}
                        >
                          {varOptions}
                        </Select>
                      }
                    </td>

                    {/* visibility */}
                    <td className="cms-selector-editor-cell">
                      {dynamicAndValid
                        ? <div>{`${option.allowed}${option.allowed !== "always" ? makeLabel(typeof option.allowed, variables[option.allowed]) : ""}`}</div>
                        : <Select
                          label="Visible"
                          labelHidden
                          namespace="cms"
                          value={option.allowed}
                          onChange={this.chooseAllowed.bind(this, i)}
                        >
                          {varOptions}
                        </Select>
                      }
                    </td>

                    {/* delete */}
                    <td className="cms-selector-editor-cell cms-delete-selector-editor-cell">
                      <Button
                        onClick={this.deleteOption.bind(this, i)}
                        namespace="cms"
                        icon="trash"
                        iconOnly
                        disabled={data.dynamic}
                      >
                        Delete entry
                      </Button>
                    </td>

                    {/* reorder */}
                    {!data.dynamic && i !== options.length - 1 &&
                      <td className="cms-selector-editor-cell cms-reorder">
                        <Button
                          onClick={this.moveDown.bind(this, i)}
                          namespace="cms"
                          className="cms-reorder-button"
                          icon="swap-vertical"
                          iconOnly
                        >
                          Swap positioning of current and next cards
                        </Button>
                      </td>
                    }
                  </tr>
                )}
              </tbody>
            </table>
            : null
        }

        {/* new option */}
        {!data.dynamic && 
          <Button
            onClick={this.addOption.bind(this)}
            className={!options.length ? "u-font-md" : null}
            namespace="cms"
            icon="plus"
            fill
          >
            {!options.length ? "Add first option" : "Add option"}
          </Button>
        }

        {/* custom default */}
        <label className={`cms-selector-editor-custom ${showCustom ? "is-visible" : "is-hidden"}`}>
          <input
            className="cms-selector-editor-custom-checkbox"
            type="checkbox"
            checked={showCustom}
            onChange={this.toggleCustom.bind(this)}
          />
          {!showCustom
            ? "Override default with custom logic"
            : <Fragment>Custom default: 
              <Select
                label=" "
                labelHidden
                namespace="cms"
                value={data.default}
                onChange={this.chooseCustom.bind(this)}
                inline
              >
                {customOptions}
              </Select>
            </Fragment>
          }
        </label>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  status: state.cms.status
});

export default connect(mapStateToProps)(SelectorEditor);
