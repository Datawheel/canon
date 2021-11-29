/* react */
import React from "react";
import {useDispatch, useSelector} from "react-redux";
import {ActionIcon, Center, Group, Header, Select} from "@mantine/core";
import {HiChevronLeft, HiOutlineCog} from "react-icons/hi";

/* redux */
import {setStatus} from "../actions/status";

/* consts */
import {ENTITY_TYPES} from "../utils/consts/cms";

/**
 *
 */
function CMSHeader({id}) {

  const dispatch = useDispatch();

  /* redux */
  const localeDefault = useSelector(state => state.cms.status.localeDefault);
  const locales = useSelector(state => state.cms.status.locales);
  // todo1.0 - is this too heavy to import the whole thing?
  const reports = useSelector(state => Object.values(state.cms.reports.entities.reports));

  const goBack = () => {
    dispatch(setStatus({pathObj: {home: true}}));
  };

  const onChangeReport = value => {
    dispatch(setStatus({pathObj: {[ENTITY_TYPES.REPORT]: Number(value)}}));
  };

  const reportOptions = reports.map(d => ({value: String(d.id), label: d.contentByLocale[localeDefault].content.label}));
  const previewOptions = ["Massachusetts", "New York", "California"].map(d => ({value: d, label: d}));
  const localeOptions = [localeDefault].concat(locales).map(d => ({value: d, label: d}));

  return (
    <Header fixed height={50} padding="xs">
      <Center>
        <Group spacing="xs">
          <ActionIcon>
            <HiChevronLeft size={20} onClick={goBack} />
          </ActionIcon>
          <Select
            style={{width: 100}}
            size="xs"
            data={reportOptions}
            value={String(id)}
            onChange={onChangeReport}
          />
          <Select
            style={{width: 300}}
            size="xs"
            data={previewOptions}
            defaultValue={previewOptions[0].value}
          />
          <Select
            style={{width: 50}}
            size="xs"
            data={localeOptions}
            defaultValue={localeOptions[0].value}
          />
          <ActionIcon color="theme">
            <HiOutlineCog size={20}/>
          </ActionIcon>
        </Group>
      </Center>

    </Header>
  );

}

export default CMSHeader;
