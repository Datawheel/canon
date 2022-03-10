/* react */
import React from "react";
import {useSelector} from "react-redux";
import {fetchData} from "@datawheel/canon-core";
import {AppShell} from "@mantine/core";
import Section from "./Section";

/** default siteSettings */
import siteSettings from "../utils/settings/site";

/**
 *
 */
function Report() {

  const report = useSelector(state => state.data.report);

  const {sections} = report;

  return (
    <AppShell className="cr-report"
      padding="0"
      styles={{backgroundColor: siteSettings.backgroundColor}}>
      {sections.map(section => <Section key={section.id} content={section} />)}
    </AppShell>
  );
}

Report.need = [
  fetchData("report", "/api/report?dimension=<slug>&member=<id>")
];

export default Report;
