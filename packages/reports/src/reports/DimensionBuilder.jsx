/* react */
import React, {useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {TextInput, Button, Group, Select} from "@mantine/core";
import axios from "axios";

/* hooks */
import useKeyPress from "./hooks/listeners/useKeyPress";

/* redux */
import {modifyDimension} from "../actions/reports";

/* utils */
import slugifyInput from "../utils/web/slugifyInput";

/**
 *
 */
function DimensionBuilder({id}) {

  /* redux */
  const dispatch = useDispatch();
  const report = useSelector(state => state.cms.reports.entities.reports[id]);

  /* state */
  const [sample, setSample] = useState();
  const [config, setConfig] = useState({});
  const [loading, setLoading] = useState(false);

  const ENTER_KEY = 13;
  const enterPress = useKeyPress(ENTER_KEY);

  const getMembers = () => {
    axios.get(config.path).then(resp => {
      const payload = resp.data[config.accessor] || resp.data.data || resp.data;
      if (payload && payload[0]) {
        const first = payload[0];
        setSample(first);
        const keys = Object.keys(first);
        setConfig({...config, id: keys[0], name: keys[0]});
      }
      else {
        // todo1.0 toast
      }

    }).catch(e => {
      // todo1.0 toast
    });
  };

  const onChange = (field, value) => {
    if (field === "slug") value = slugifyInput(value);
    setConfig({...config, [field]: value});
  };

  const onSubmit = () => {
    setLoading(true);
    dispatch(modifyDimension(config)).then(resp => {
      console.log(resp);
      setLoading(false);
    }).catch(e => {
      // todo1.0 toast
      setLoading(false);
    });
  };

  if (config.path && enterPress) getMembers();

  const keys = Object.keys(sample || {}).map(d => ({value: d, label: `${d}: ${sample[d]}`}));
  const complete = ["id", "name", "slug", "label"].every(d => config[d]);

  return (
    <div>
      <TextInput onChange={e => onChange("path", e.target.value)} label="Enter a source API" value={config.path} />
      <TextInput value={config.accessor} styles={{input: {fontFamily: "monospace"}}} label="accessor" onChange={e => onChange("accessor", e.target.value)} />
      <Button onClick={() => getMembers()}>Fetch</Button>
      {sample &&
        <Group direction="column">
          <TextInput value={config.label} label="label" onChange={e => onChange("label", e.target.value)} />
          <TextInput value={config.slug} label="slug" onChange={e => onChange("slug", e.target.value)} />
          <Select value={config.id} label="id" data={keys} onChange={e => onChange("id", e)}></Select>
          <Select value={config.name} label="name" data={keys} onChange={e => onChange("name", e)}></Select>
          <Button disabled={!complete} loading={loading} onClick={onSubmit}>{loading ? "Ingesting" : "Ingest"}</Button>
        </Group>
      }
    </div>
  );

}

export default DimensionBuilder;
