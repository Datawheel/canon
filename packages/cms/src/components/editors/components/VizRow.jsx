import React, {Component} from "react";
import TextInput from "../../fields/TextInput";
import Select from "../../fields/Select";
import Button from "../../fields/Button";

class VizRow extends Component {

  render() {

    const {
      method, 
      object, 
      onChange, 
      onCheck, 
      onChangeFormatter, 
      onKeyAdd,
      firstObj, 
      options,
      formatterList
    } = this.props;

    const selectedColumns = object.columns || [];
    const allFields = Object.keys(firstObj);

    let values = [];
    if (method.multiple) {
      if (typeof object[method.key] === "string") {
        values = [object[method.key]];
      }
      if (Array.isArray(object[method.key])) {
        values = object[method.key];
      }
    }
    else {
      values = [object[method.key]];
    }

    return (
      <React.Fragment>
        {
          values.map((value, i) => 
            <React.Fragment key={`value-${i}`}>
              {method.format === "Input" && 
                <TextInput
                  label={method.display}
                  namespace="cms"
                  fontSize="xs"
                  inline
                  key={method.key}
                  value={value}
                  onChange={e => onChange(method.key, e)}
                />
              }
              {method.format === "Checkbox" && 
                <fieldset className="cms-fieldset">
                  <legend className="u-font-sm">Columns</legend>
                  {allFields.map(column =>
                    <label className="cms-checkbox-label u-font-xs" key={column}>
                      <input
                        type="checkbox"
                        checked={selectedColumns.includes(column)}
                        onChange={() => onCheck(column)}
                      /> {column}
                    </label>
                  )}
                </fieldset>
              }
              {(method.format === "Accessor" || method.format === "Variable") &&
                <React.Fragment>
                  <Select
                    key="cms-key-select"
                    label={ method.multiple 
                      ? <span>
                        {method.display}
                        <Button 
                          onClick={() => onKeyAdd(method.key)}
                          icon="plus" 
                          iconOnly
                        >
                          Add Grouping
                        </Button>
                      </span> 
                      : method.display
                    }
                    namespace="cms"
                    fontSize="xs"
                    value={value}
                    onChange={e => onChange(method.key, e)}
                    inline
                  >
                    {options}
                  </Select>
                  <Select
                    key="cms-formatter-select"
                    label={`${method.display} formatter`}
                    labelHidden
                    namespace="cms"
                    fontSize="xs"
                    value={object.formatters ? object.formatters[method.key] : "manual-none"}
                    onChange={e => onChangeFormatter(method.key, e)}
                    inline
                  >
                    <option key={null} value="manual-none">No formatter</option>
                    {formatterList.map(f => <option key={f} value={f}>{f}</option>)}
                  </Select>
                </React.Fragment>
              }
            </React.Fragment>
          )
        }
      </React.Fragment>
    );
  }
}

export default VizRow;
