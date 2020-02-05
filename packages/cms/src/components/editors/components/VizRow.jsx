import React, {Component} from "react";
import TextInput from "../../fields/TextInput";
import Select from "../../fields/Select";
import Button from "../../fields/Button";

import "./VizRow.css";

class VizRow extends Component {

  render() {

    const {
      method, 
      object, 
      onChange, 
      onCheck, 
      onChangeFormatter, 
      onKeyAdd,
      onKeyRemove,
      firstObj, 
      options,
      formatterList
    } = this.props;

    const selectedColumns = object.columns || [];
    const allFields = Object.keys(firstObj);

    const values = method.multiple ? object[method.key] : [object[method.key]];

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
                      ? i === 0 
                        ? <span>
                          {method.display}
                          <Button 
                            className="cms-vizrow-button"
                            onClick={() => onKeyAdd(method.key)}
                            icon="plus" 
                            iconOnly
                          >
                            {`Add ${method.display}`}
                          </Button>
                        </span> 
                        : <span>
                          {method.display}
                          <Button 
                            className="cms-vizrow-button"
                            onClick={() => onKeyRemove(method.key, i)}
                            icon="minus" 
                            iconOnly
                          >
                            {`Add ${method.display}`}
                          </Button>
                        </span> 
                      : method.display
                    }
                    namespace="cms"
                    fontSize="xs"
                    value={value}
                    onChange={e => method.multiple ? onChange(method.key, e, i) : onChange(method.key, e)}
                    inline
                  >
                    {options}
                  </Select>
                  <Select
                    key="cms-formatter-select"
                    label={`${method.display} formatter`}
                    labelHidden
                    disabled={method.multiple && i < values.length - 1}
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
