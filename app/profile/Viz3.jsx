import React from "react";
import {Treemap} from "d3plus-react";

import {fetchData} from "../../src/actions/fetchData";
import {dataFold} from "d3plus-viz";

import {SectionColumns} from "../../src";

class Viz3 extends SectionColumns {

  render() {
    const data = this.context.data.harvested_area;
    return (
      <SectionColumns>
        <Treemap config={{
          data,
          groupBy: "crop",
          height: 400,
          label: d => d.crop_name,
          legend: false,
          sum: d => d.harvested_area
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
