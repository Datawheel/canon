import React from "react";

function DatasetSelect(props) {
  const cubeName = props.value.annotations._vb_cbName;
  return (
    <span className="pt-select pt-fill">
      <select
        className={props.className}
        name="dataset"
        onChange={props.onChange}
        value={cubeName}
      >
        {props.items.map(item =>
          <option
            key={item.annotations._vb_cbName}
            value={item.annotations._vb_cbName}
          >
            {item.annotations._vb_datasetName}
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
