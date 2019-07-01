import React, {Component} from "react";
import Button from "../fields/Button";
import ButtonGroup from "../fields/ButtonGroup";
import Select from "../fields/Select";
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
    // Temporarily overload the options list itself as a tracker for checkboxes.
    // Note that we still ship the whole object to the db when we save, but these isDefault switches won't be written.
    data.options = data.options.map(o => {
      if (data.type === "single") {
        o.isDefault = o.option === data.default;
      }
      else if (data.type === "multi") {
        const defaults = data.default.split(",");
        o.isDefault = defaults.includes(o.option);
      }
      return o;
    });
    const showCustom = data.default.includes("{{");
    this.setState({data, showCustom});
  }

  addOption() {
    const {data, isDirty} = this.state;
    const {variables} = this.props;
    if (!data.options) data.options = [];
    const varList = Object.keys(variables).filter(v => !v.startsWith("_") && !data.options.map(o => o.option).includes(v));
    if (varList.length > 0) {
      data.options.push({option: varList[0], allowed: "always", isDefault: false});
    }
    else {
      data.options.push({option: "", allowed: "always", isDefault: false});
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

  setDefault(option, e) {
    const {data, isDirty} = this.state;
    const {checked} = e.target;
    if (data.type === "single" && checked) {
      data.options = data.options.map(o => {
        o.isDefault = o.option === option;
        return o;
      });
      data.default = option;
    }
    else if (data.type === "multi") {
      const theOption = data.options.find(o => o.option === option);
      if (theOption) theOption.isDefault = checked;
      data.default = data.options.filter(o => o.isDefault).map(o => o.option).join();
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
    data.options.splice(i, 1);
    // If the last default was deleted, make the first option the new default
    if (data.options.length > 0 && !data.options.map(o => o.isDefault).includes(true)) {
      data.options[0].isDefault = true;
      data.default = data.options[0].option;
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
      let foundDefault = false;
      data.options = data.options.map(o => {
        if (!foundDefault) {
          if (o.isDefault) {
            foundDefault = true;
            data.default = o.option;
          }
        }
        else {
          o.isDefault = false;
        }
        return o;
      });
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

  render() {

    const {data, showCustom} = this.state;
    const {variables} = this.props;

    if (!data || !variables) return null;

    const varOptions = [<option key="always" value="always">Always</option>]
      .concat(Object.keys(variables)
        .filter(key => !key.startsWith("_"))
        .filter(key => typeof variables[key] !== "object")
        .sort((a, b) => a.localeCompare(b))
        .map(key => {
          const value = variables[key];
          const type = typeof value;
          const label = !["string", "number", "boolean"].includes(type) ? ` <i>(${type})</i>` : `: ${`${value}`.slice(0, 20)}${`${value}`.length > 20 ? "..." : ""}`;
          return <option key={key} value={key} dangerouslySetInnerHTML={{__html: `${key}${label}`}}></option>;
        }));

    const customOptions = Object.keys(variables)
      .filter(key => !key.startsWith("_"))
      .filter(key => typeof variables[key] !== "object")
      .sort((a, b) => a.localeCompare(b))
      .map(key => {
        const value = variables[key];
        const type = typeof value;
        const label = !["string", "number", "boolean"].includes(type) ? ` <i>(${type})</i>` : `: ${`${value}`.slice(0, 20)}${`${value}`.length > 20 ? "..." : ""}`;
        return <option key={`{{${key}}}`} value={`{{${key}}}`} dangerouslySetInnerHTML={{__html: `${key}${label}`}}></option>;
      });

    return (
      <div className="cms-selector-editor">

        <div className="cms-field-group">
          <label className="cms-field-container">
            Selector name
            <input className="bp3-input" value={data.name} onChange={this.editName.bind(this)} />
          </label>

          <label className="cms-field-container">
            Input label
            <input className="bp3-input" value={data.title} onChange={this.editLabel.bind(this)} />
          </label>
        </div>

        <ButtonGroup className="cms-selector-editor-button-group" buttons={[
          {
            children: "single selection",
            className: "font-xs",
            active: data.type === "single",
            onClick: this.handleTypeChange.bind(this, "single"),
            icon: "layer",
            iconPosition: "left"
          },
          {
            children: "multiple selections",
            className: "font-xs",
            active: data.type === "multi",
            onClick: this.handleTypeChange.bind(this, "multi"),
            icon: "layers",
            iconPosition: "left"
          }
        ]} />

        {data.options.length > 0 &&
          <table className="cms-selector-editor-table">
            <thead className="cms-selector-editor-thead">
              <tr className="cms-selector-editor-row">
                <td className="cms-selector-editor-cell">Default</td>
                <td className="cms-selector-editor-cell">Option</td>
                <td className="cms-selector-editor-cell">Visible</td>
                <td className="cms-selector-editor-cell" colSpan="2">Actions</td>
              </tr>
            </thead>

            <tbody className="cms-selector-editor-tbody">
              {data.options.map((option, i) =>
                <tr className="cms-selector-editor-row" key={i}>

                  {/* default */}
                  <td className="cms-selector-editor-cell">
                    <input
                      type={data.type === "multi" ? "checkbox" : "radio"}
                      checked={option.isDefault}
                      onChange={this.setDefault.bind(this, option.option)}
                    /><span className="u-visually-hidden">default option</span>
                  </td>

                  {/* option */}
                  <td className="cms-selector-editor-cell">
                    <Select
                      label="option (new)"
                      labelHidden
                      value={option.option}
                      onChange={this.chooseOption.bind(this, i)}
                    >
                      {varOptions}
                    </Select>
                  </td>

                  {/* visibility */}
                  <td className="cms-selector-editor-cell">
                    <Select
                      label="visibility"
                      labelHidden
                      value={option.allowed}
                      onChange={this.chooseAllowed.bind(this, i)}
                    >
                      {varOptions}
                    </Select>
                  </td>

                  {/* delete */}
                  <td className="cms-selector-editor-cell cms-delete-selector-editor-cell">
                    <Button
                      onClick={this.deleteOption.bind(this, i)}
                      icon="trash"
                      iconOnly
                    >
                      Delete entry
                    </Button>
                  </td>

                  {/* reorder */}
                  {i !== data.options.length - 1 &&
                    <td className="cms-selector-editor-cell cms-reorder">
                      <Button
                        onClick={this.moveDown.bind(this, i)}
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
        }


        {/* new option */}
        <Button
          onClick={this.addOption.bind(this)}
          className={!data.options.length ? "font-md" : null}
          icon="plus"
          block
        >
          {!data.options.length ? "Add first option" : "Add option"}
        </Button>


        {/* custom default */}
        <label className={`cms-selector-editor-custom ${showCustom ? "is-visible" : "is-hidden"}`}>
          <input
            className="cms-selector-editor-custom-checkbox"
            type="checkbox"
            checked={showCustom}
            onClick={this.toggleCustom.bind(this)}
          />
          {!showCustom
            ? "Override default with custom logic"
            : <React.Fragment>Custom default: 
              <Select
                label=" "
                labelHidden
                value={data.default}
                onChange={this.chooseCustom.bind(this)}
                inline
              >
                {customOptions}
              </Select>
            </React.Fragment>
          }
        </label>
      </div>
    );
  }
}

export default SelectorEditor;
