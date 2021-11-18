/* react */
import React from "react";
import {useDispatch, useSelector} from "react-redux";
import {ActionIcon, Center, Group, Select} from "@mantine/core";
import {HiOutlineCog} from "react-icons/hi";

/* redux */
import {setStatus} from "../actions/status";

/* consts */
import {ENTITY_TYPES} from "../utils/consts/cms";

/* css */
import "./CMSHeader.css";

/**
 *
 */
function CMSHeader({id}) {

  const dispatch = useDispatch();

  /* redux */
  const localeDefault = useSelector(state => state.cms.status.localeDefault);
  const locales = useSelector(state => state.cms.status.locales);
  // todo1.0 - is this too heavy to import the whole thing?
  const profiles = useSelector(state => Object.values(state.cms.profiles.entities.profiles));

  const goBack = () => {
    dispatch(setStatus({pathObj: {home: true}}));
  };

  const onChangeReport = value => {
    dispatch(setStatus({pathObj: {[ENTITY_TYPES.PROFILE]: Number(value)}}));
  };

  const reportOptions = profiles.map(d => ({value: String(d.id), label: d.contentByLocale[localeDefault].content.label}));
  const previewOptions = ["Massachusetts", "New York", "California"].map(d => ({value: d, label: d}));
  const localeOptions = [localeDefault].concat(locales).map(d => ({value: d, label: d}));

  return (
    <div className="cms-header">
      <span className="cms-header-return-link" onClick={goBack}>{"<="}Choose another Profile</span>
      <Center>
        <Group style={{marginTop: 15}}>
          <Select
            style={{width: 100}}
            size="xs"
            label="Choose a Report"
            data={reportOptions}
            value={String(id)}
            onChange={onChangeReport}
          />
          <Select
            style={{width: 200}}
            size="xs"
            label="Preview as"
            data={previewOptions}
            defaultValue={previewOptions[0].value}
          />
          <Select
            style={{width: 50}}
            label="Locale"
            size="xs"
            data={localeOptions}
            defaultValue={localeOptions[0].value}
          />
          <ActionIcon style={{marginTop: 29}}><HiOutlineCog size={50}/></ActionIcon>
        </Group>
      </Center>

    </div>
  );

}

export default CMSHeader;
