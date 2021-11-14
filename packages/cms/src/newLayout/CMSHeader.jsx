import React, {useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {ActionIcon, Button, Center, Group, Select} from "@mantine/core";
import {HiOutlineCog} from "react-icons/hi";

import {setStatus} from "../actions/status";

import {ENTITY_TYPES} from "../utils/consts/cms";

import "./CMSHeader.css";

/**
 *
 */
function CMSHeader({id}) {

  const dispatch = useDispatch();

  /* redux */
  const {localeDefault, localeSecondary, locales, profiles} = useSelector(state => ({
    localeDefault: state.cms.status.localeDefault,
    localeSecondary: state.cms.status.localeSecondary,
    locales: state.cms.status.locales,
    // todo1.0 - is this too heavy to import the whole thing?
    profiles: Object.values(state.cms.profiles.entities.profiles)
  }));

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
