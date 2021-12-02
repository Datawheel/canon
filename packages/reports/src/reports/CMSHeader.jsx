/* react */
import axios from "axios";
import React, {forwardRef, useState, useEffect} from "react";
import {useDispatch, useSelector} from "react-redux";
import {ActionIcon, Center, Group, Header, Select, Modal, Autocomplete} from "@mantine/core";
import {useDebouncedValue} from "@mantine/hooks";
import {HiChevronLeft, HiOutlineCog} from "react-icons/hi";

/* components */
import DimensionBuilder from "./DimensionBuilder";

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
  const preview = useSelector(state => state.cms.status.preview);
  // todo1.0 - is this too heavy to import the whole thing?
  const reports = useSelector(state => Object.values(state.cms.reports.entities.reports));

  const [opened, setOpened] = useState(false);
  const [query, setQuery] = useState("");
  const [debouncedQuery] = useDebouncedValue(query, 500);
  const [results, setResults] = useState([]);

  useEffect(() => {
    axios.get(`/api/reports/newsearch?query=${debouncedQuery}`).then(resp => {
      setResults(resp.data);
    });
  }, [debouncedQuery]);

  const goBack = () => {
    dispatch(setStatus({pathObj: {home: true}}));
  };

  const onChangeReport = value => {
    dispatch(setStatus({pathObj: {[ENTITY_TYPES.REPORT]: Number(value)}}));
  };

  const onSelectPreview = preview => {
    dispatch(setStatus({preview}));
    setQuery(preview.name);
  };

  const modalProps = {
    title: "Dimension Builder",
    opened,
    size: "50%",
    onClose: () => setOpened(false)
  };

  const reportOptions = reports.map(d => ({value: String(d.id), label: d.contentByLocale[localeDefault].content.label}));
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
          <Autocomplete
            style={{width: 300}}
            filter={(value, item) => item.name.toLowerCase().includes(value.toLowerCase().trim())}
            size="xs"
            itemComponent={forwardRef(({name, ...others}, ref) => <div {...others} ref={ref}>{name}</div>)} //eslint-disable-line
            value={query}
            onChange={e => setQuery(e)}
            onItemSubmit={onSelectPreview}
            data={results}
          />
          <Select
            style={{width: 50}}
            size="xs"
            data={localeOptions}
            defaultValue={localeOptions[0].value}
          />
          <ActionIcon color="theme">
            <HiOutlineCog onClick={() => setOpened(true)} size={20}/>
          </ActionIcon>
        </Group>
      </Center>
      <Modal {...modalProps}>
        <DimensionBuilder id={id}/>
      </Modal>

    </Header>
  );

}

export default CMSHeader;
