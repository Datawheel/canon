import React from "react";
import {Treemap} from "d3plus-react";
import {translate} from "react-i18next";
import {dataFold} from "d3plus-viz";

import {fetchData} from "../../src/actions/fetchData";

import {SectionColumns, SectionTitle} from "../../src";

class Viz1 extends SectionColumns {

  render() {
    const data = this.context.data.harvested_area;
    const {t} = this.props;

    const show = false;

    return (
      <SectionColumns>
        <SectionTitle>My Cool Title</SectionTitle>
        <article>
          { t("Some Text") }
        </article>
        { show ? <div>Show me!</div> : null }
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

Viz1.defaultProps = {
  slug: "Viz1"
};

Viz1.need = [
  fetchData("harvested_area", "api/join/?geo=<id>&show=crop&required=harvested_area,value_of_production&order=harvested_area&sort=desc&display_names=true", dataFold)
];

export default translate()(Viz1);
