import {fetchData, SectionRows, SectionTitle} from "@datawheel/canon-core";
import {Treemap} from "d3plus-react";
import {dataFold} from "d3plus-viz";
import React from "react";

class Viz2 extends SectionRows {

  render() {
    const data = this.context.data.harvested_area;
    return (
      <SectionRows>
        <SectionTitle>My Cool Title</SectionTitle>
        <article>Some Text</article>
        <Treemap config={{
          // colorScale: "harvested_area",
          data,
          groupBy: "crop",
          height: 400,
          label: d => d.crop_name,
          legend: false,
          sum: d => d.harvested_area
        }} />
      </SectionRows>
    );
  }
}

Viz2.defaultProps = {
  shortTitle: "Cool",
  slug: "Viz2",
  title: "My Cool Title"
};

Viz2.need = [
  fetchData("harvested_area", "api/join/?geo=<id>&show=crop&required=harvested_area,value_of_production&order=harvested_area&sort=desc&display_names=true", dataFold)
];

export default Viz2;
