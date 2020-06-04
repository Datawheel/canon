import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";
import {Treemap} from "d3plus-react";
import {dataFold} from "d3plus-viz";
import PropTypes from "prop-types";
import React from "react";
import {withNamespaces} from "react-i18next";

class Viz1 extends SectionColumns {

  render() {

    const {t} = this.props;
    const {router} = this.context;

    return (
      <SectionColumns>
        <SectionTitle>My Cool Title</SectionTitle>
        <article>{ t("Some Text") }</article>
        <Treemap config={{
          data: this.context.data.harvested_area,
          // data: "https://api.dataafrica.io/api/join/?geo=040AF00182&show=crop&required=harvested_area,value_of_production&order=harvested_area&sort=desc&display_names=true",
          // data: [],
          groupBy: "crop",
          height: 400,
          label: d => d.crop_name,
          legend: false,
          on: {
            click: () => {
              router.push("/");
            }
          },
          sum: d => d.harvested_area
        }}
        dataFormat={dataFold}
        />
      </SectionColumns>
    );
  }
}

Viz1.defaultProps = {
  slug: "Viz1"
};

Viz1.contextTypes = {
  data: PropTypes.object,
  router: PropTypes.object
};

Viz1.need = [
  fetchData("harvested_area", "api/join/?geo=<id>&show=crop&required=harvested_area,value_of_production&order=harvested_area&sort=desc&display_names=true", dataFold)
];

export default withNamespaces()(Viz1);
