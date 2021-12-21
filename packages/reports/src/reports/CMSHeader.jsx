/* react */
import axios from "axios";
import React, {forwardRef, useState, useEffect, useRef} from "react";
import {useDispatch, useSelector} from "react-redux";
import {ActionIcon, Center, Group, Header, Select, Modal, Autocomplete, Button} from "@mantine/core";
import {useDebouncedValue} from "@mantine/hooks";
import {HiChevronLeft, HiOutlineCog} from "react-icons/hi";

/* components */
import DimensionBuilder from "./dimensions/DimensionBuilder";

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
  const previews = useSelector(state => state.cms.status.pathObj.previews);
  const currentReport = useSelector(state => state.cms.status.currentReport);
  const reports = useSelector(state => state.cms.reports.entities.reports);
  const pathObj = useSelector(state => state.cms.status.pathObj);
  const metas = useSelector(state => state.cms.reports.entities.meta);
  const meta = reports[currentReport]?.meta || [];


  const [opened, setOpened] = useState(false);
  const [query, setQuery] = useState("");
  const [debouncedQuery] = useDebouncedValue(query, 500);
  const [results, setResults] = useState([]);

  const inputRef = useRef();

  useEffect(() => {
    const params = {
      query: debouncedQuery,
      // todo1.0 fix this accessor for bilaterals
      namespace: metas && meta && meta[0] ? metas[meta[0]].namespace : ""
    };
    const paramString = Object.keys(params).map(key => `${key}=${params[key]}`).join("&");

    axios.get(`/api/reports/newsearch?${paramString}`).then(resp => {
      setResults(resp.data);
    });
  }, [debouncedQuery]);

  useEffect(() => {
    // todo1.0 make bilateral
    if (previews && previews[0]) setQuery(previews[0].name);
  }, [previews]);

  const goBack = () => {
    dispatch(setStatus({pathObj: {home: true, previews: []}}));
  };

  const onChangeReport = value => {
    dispatch(setStatus({pathObj: {[ENTITY_TYPES.REPORT]: Number(value)}}));
  };

  const onSelectPreview = preview => {
    const newPathObj = {...pathObj, previews: [preview.slug]}; // todo1.0 fix this spread to work with bilaterals
    dispatch(setStatus({pathObj: newPathObj}));
    setQuery(preview.name);
  };

  const modalProps = {
    title: "Dimension Builder",
    key: "modal",
    opened,
    size: "50%",
    onClose: () => setOpened(false)
  };

  const reportOptions = Object.values(reports).map(d => ({value: String(d.id), label: d.contentByLocale[localeDefault].content.label}));
  const localeOptions = [localeDefault].concat(locales).map(d => ({value: d, label: d}));

  const showPreviewSelector = meta.length > 0;

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
          {showPreviewSelector
            ? <Autocomplete
              style={{width: 300}}
              filter={(value, item) => item.name.toLowerCase().includes(value.toLowerCase().trim())}
              size="xs"
              ref={inputRef}
              onClick={() => inputRef.current.select()}
              placeholder="Choose a member to preview"
              itemComponent={forwardRef(({id, name, ...others}, ref) => <div {...others} key={`${id}-${name}`} ref={ref}>{name}</div>)} //eslint-disable-line
              value={query}
              onChange={e => setQuery(e)}
              onItemSubmit={onSelectPreview}
              data={results}
            />
            : <Button variant="outline" onClick={() => setOpened(true)}>Import Data</Button>
          }
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
