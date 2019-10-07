import {HTMLSelect} from "@blueprintjs/core";
import React, {memo} from "react";
import ConditionalAnchor from "./ConditionalAnchor";

/**
 * @typedef OwnProps
 * @property {string} [className]
 * @property {boolean} [fill]
 * @property {MeasureItem} measure
 * @property {MeasureItem[]} measures
 * @property {(event: React.ChangeEvent<HTMLSelectElement>) => void} onChange
 */

/** @type {React.NamedExoticComponent<OwnProps>} */
const DatasetSelect = memo(function({className, fill, measure, measures, onChange}) {
  if (measures.length < 2) {
    return (
      <ConditionalAnchor className="source-link" href={measure.datasetHref}>
        {measure.datasetName}
      </ConditionalAnchor>
    );
  }

  const options = measures.map(measure => ({
    label: measure.datasetName,
    value: measure.cube
  }));

  return (
    <HTMLSelect
      className={className}
      fill={fill}
      name="dataset"
      onChange={onChange}
      options={options}
      value={measure.cube}
    />
  );
});

export default DatasetSelect;
