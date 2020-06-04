import {fetchData, SectionColumns} from "@datawheel/canon-core";
import {Plot, Treemap} from "d3plus-react";
import {dataFold} from "d3plus-viz";
import React from "react";

class Viz3 extends SectionColumns {

  render() {
    const data = this.context.data.harvested_area;
    return (
      <SectionColumns>
        <Plot config={{
          data,
          groupBy: "crop",
          height: 400,
          label: d => d.crop_name,
          legend: false,
          x: "harvested_area",
          y: "harvested_area"
        }} />
        <Treemap config={{
          data,
          groupBy: "crop",
          height: 400,
          label: d => d.crop_name,
          legend: false,
          sum: d => d.harvested_area
        }} />
      </SectionColumns>
    );
  }
}

Viz3.defaultProps = {
  slug: "Viz3"
};

Viz3.need = [
  fetchData("harvested_area", "api/join/?geo=<id>&show=crop&required=harvested_area,value_of_production&order=harvested_area&sort=desc&display_names=true", dataFold)
];

export default Viz3;
