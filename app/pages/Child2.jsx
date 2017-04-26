import React from "react";
import {Treemap} from "d3plus-react";

import {fetchData} from "../../src/actions/fetchData";

import {SectionRows} from "../../src/components/Section";
import {SectionTitle} from "../../src/components/SectionTitle";

class Child2 extends SectionRows {

  render() {
    const data = this.context.data.harvested_area;
    return (
      <SectionRows>
        <SectionTitle>My Cool Title</SectionTitle>
        <article>Some Text</article>
        <Treemap config={{
          colorScale: "harvested_area",
          data,
          groupBy: "crop",
          label: d => d.crop_name,
          legend: false,
          sum: d => d.harvested_area
        }} />
    </SectionRows>
    );
  }
}

Child2.need = [
  fetchData("harvested_area", "api/join/?geo=<id>&show=crop&required=harvested_area,value_of_production&order=harvested_area&sort=desc&display_names=true")
];

export default Child2;
