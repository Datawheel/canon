import React, {Component} from "react";
import {withNamespaces} from "react-i18next";
import {Tooltip} from "@blueprintjs/core";
import "./SourceGroup.css";

class SourceGroup extends Component {

  render() {
    const {sources, t} = this.props;
    if (!sources || !sources.length) return null;

    return <div className="SourceGroup">
      {t("Data provided by")}
      { sources.map((source, i) => {

        const {
          dataset_description: datasetDesc,
          dataset_link: datasetLink,
          dataset_name: dataset,
          source_description: orgDesc,
          source_link: orgLink,
          source_name: org
        } = source;

        const orgName = org && `the ${org.replace(/^(T|t)he\s/g, "")}`;
        const datasetName = dataset && `${dataset}`;

        return <span key={i} className="source">
          { i && i === sources.length - 1 ? <span> {t("and")}</span> : null }
          { org && <span>&nbsp;</span> }
          { org && <Tooltip content={orgDesc} className={orgDesc ? "active" : ""} disabled={!orgDesc}>
            { orgLink ? <a href={orgLink} target="_blank" rel="noopener noreferrer" dangerouslySetInnerHTML={{__html: orgName}} /> : <span dangerouslySetInnerHTML={{__html: orgName}} /> }
          </Tooltip> }
          { dataset && <span>&nbsp;</span> }
          { dataset && <Tooltip content={datasetDesc} className={datasetDesc ? "active" : ""} disabled={!datasetDesc}>
            { datasetLink ? <a href={datasetLink} target="_blank" rel="noopener noreferrer" dangerouslySetInnerHTML={{__html: datasetName}} /> : <span dangerouslySetInnerHTML={{__html: datasetName}} /> }
          </Tooltip> }
          { i < sources.length - 1 && <span>,</span> }
          <span>.</span>
        </span>;
      })}
    </div>;
  }

}

export default withNamespaces()(SourceGroup);
