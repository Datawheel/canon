import React from "react";

import {fetchData} from "actions/home";

import {SectionColumns} from "../../src/components/Section";

class Child extends SectionColumns {

  render() {
    console.log("Child", this.context.data);
    return (
      <SectionColumns title="My Cool Title">
        <article>Some Text</article>
        <div>Other Div</div>
      </SectionColumns>
    );
  }
}

Child.need = [
  fetchData("harvested_area", "api/join/?geo=040AF00182&show=crop&required=harvested_area,value_of_production&order=harvested_area&sort=desc&display_names=true")
];

export default Child;
