import React from "react";

function DatasetSelect(props) {
  const cubeName = props.value.annotations._cb_name;
  return (
    <span className="pt-select">
      <select
        className={props.className}
        name="dataset"
        onChange={props.onChange}
        value={cubeName}
      >
        {props.items.map(item =>
          <option
            key={item.annotations._cb_name}
            value={item.annotations._cb_name}
          >
            {item.annotations._cb_datasetName}
          </option>
        )}
      </select>
    </span>
  );
}

DatasetSelect.defaultProps = {
  items: []
};

export default DatasetSelect;
