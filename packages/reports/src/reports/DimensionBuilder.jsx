/* react */
import React, {useState, useEffect} from "react";
import {useDispatch, useSelector} from "react-redux";
import {TextInput, Button, Group, Select} from "@mantine/core";
import axios from "axios";

/* hooks */
import useKeyPress from "./hooks/listeners/useKeyPress";

/* redux */
import {modifyDimension} from "../actions/reports";

/* utils */
import slugifyInput from "../utils/web/slugifyInput";
import {arrayFinder, keyDiver} from "../utils/arrayFinder";
import upperCaseFirst from "../utils/formatters/upperCaseFirst";

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
  const [payload, setPayload] = useState();
  const [accessors, setAccessors] = useState([]);

  const ENTER_KEY = 13;
  const enterPress = useKeyPress(ENTER_KEY);

  useEffect(() => setAccessors(arrayFinder(payload)), [payload]);

  const getMembers = () => {
    axios.get(config.path).then(resp => {
      setPayload(resp.data);
      // todo1.0 error/toast/else
    }).catch(e => {
      // todo1.0 toast
    });
  };

  const setConfigFromSample = (sample, accessor) => {
    const sampleKeys = Object.keys(sample);
    const guessSlug = accessor.split(".")[0];
    const guessId = sampleKeys.find(d => d.toLowerCase().includes("id")) || sampleKeys[0];
    const guessName = sampleKeys.find(d => !d.toLowerCase().includes("id")) || sampleKeys[0];
    setConfig({
      ...config,
      label: upperCaseFirst(guessSlug),
      slug: guessSlug,
      id: guessId,
      name: guessName,
      accessor
    });
    setSample(sample);
  };

  const onChangeAccessor = accessor => {
    const dataArray = keyDiver(payload, accessor);
    if (dataArray[0]) {
      setConfigFromSample(dataArray[0], accessor);
    }
    else {
      // todo1.0 toast
    }
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
  const accessorSelectData = accessors.map(d => ({value: d, label: d}));

  return (
    <div>
      <TextInput onChange={e => onChange("path", e.target.value)} label="Enter a source API" value={config.path} />
      <Button onClick={() => getMembers()}>Fetch</Button>
      {payload &&
        <Group direction="column">
          <Select value={config.accessor} label="accessor" data={accessorSelectData} onChange={e => onChangeAccessor(e)}></Select>
          {sample &&
            <React.Fragment>
              <TextInput value={config.label} label="label" onChange={e => onChange("label", e.target.value)} />
              <TextInput value={config.slug} label="slug" onChange={e => onChange("slug", e.target.value)} />
              <Select value={config.id} label="id" data={keys} onChange={e => onChange("id", e)}></Select>
              <Select value={config.name} label="name" data={keys} onChange={e => onChange("name", e)}></Select>
              <Button disabled={!complete} loading={loading} onClick={onSubmit}>{loading ? "Ingesting" : "Ingest"}</Button>
            </React.Fragment>
          }
        </Group>
      }
    </div>
  );

}

export default DimensionBuilder;
