import {Anchor, Tooltip} from "@mantine/core";
import React, {useContext} from "react";
import ProfileContext from "../ProfileContext";


const SourceGroup = ({sources}) => {
  const {t} = useContext(ProfileContext);
  if (!sources || !sources.length) return null;

  return <div className="SourceGroup u-font-xs">
    {t("CMS.SourceGroup.Data provided by")}
    { sources.map((source, i) => {

      const {
        dataset_description: datasetDesc,
        dataset_link: datasetLink,
        dataset_name: dataset,
        source_description: orgDesc,
        source_link: orgLink,
        source_name: orgName
      } = source;

      const datasetName = dataset && `${dataset}`;

      return <span key={i} className="source">
        { i && i === sources.length - 1 ? <span> {t("CMS.SourceGroup.and")}</span> : null }
        { orgName && <span>&nbsp;</span> }
        { orgName && <Tooltip label={orgDesc} disabled={!orgDesc}>
          { orgLink ? <Anchor href={orgLink} target="_blank" rel="noopener noreferrer" dangerouslySetInnerHTML={{__html: orgName}} /> : <span dangerouslySetInnerHTML={{__html: orgName}} /> }
        </Tooltip> }
        { dataset && <span>&nbsp;</span> }
        { dataset && <Tooltip content={datasetDesc} disabled={!datasetDesc}>
          { datasetLink ? <a href={datasetLink} target="_blank" rel="noopener noreferrer" dangerouslySetInnerHTML={{__html: datasetName}} /> : <span dangerouslySetInnerHTML={{__html: datasetName}} /> }
        </Tooltip> }
        { i < sources.length - 1 && <span>,</span> }
        <span>.</span>
      </span>;
    })}
  </div>;


};

export default SourceGroup;
