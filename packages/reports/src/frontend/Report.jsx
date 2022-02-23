/* react */
import React from "react";
import {useSelector} from "react-redux";
import {fetchData} from "@datawheel/canon-core";
import Section from "./Section";

/**
 *
 */
function Report() {

  const report = useSelector(state => state.data.report);

  const {sections} = report;

  return (
    <div>
      {sections.map(section => <Section key={section.id} content={section} />)}
    </div>
  );
}

Report.need = [
  fetchData("report", "/api/report?dimension=<slug>&member=<id>")
];

export default Report;
