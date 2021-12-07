/* react */
import React, {useState, useEffect} from "react";
import {useDispatch, useSelector} from "react-redux";
import {TextInput, Button, Group, Select} from "@mantine/core";
import {HiOutlinePlusCircle, HiOutlineTrash} from "react-icons/hi";
import axios from "axios";

/* hooks */
import useKeyPress from "../hooks/listeners/useKeyPress";

/* redux */
import {modifyDimension} from "../../actions/reports";

/* utils */
import slugifyInput from "../../utils/web/slugifyInput";
import {arrayFinder, keyDiver} from "../../utils/arrayFinder";
import upperCaseFirst from "../../utils/formatters/upperCaseFirst";

/**
 *
 */
function DimensionEditor({id, metaId}) {

  /* redux */
  const dispatch = useDispatch();
  const meta = useSelector(state => state.cms.reports.entities.meta ? state.cms.reports.entities.meta[metaId] : null);

  /* state */
  const [sample, setSample] = useState();
  const [config, setConfig] = useState({report_id: id});
  const [loading, setLoading] = useState(false);
  const [payload, setPayload] = useState();
  const [accessors, setAccessors] = useState([]);

  useEffect(() => {
    if (meta) setConfig(meta); // todo1.0 properly populate here
  }, []);

  const enterPress = useKeyPress(13);

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
      namespace: guessSlug,
      idKey: guessId,
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
    dispatch(modifyDimension({config})).then(resp => {
      console.log(resp);
      setLoading(false);

    }).catch(e => {
      // todo1.0 toast
      setLoading(false);
    });
  };

  const addProperty = () => {
    const sampleKeys = Object.keys(sample);
    const sampleKey = sampleKeys[0];
    if (sampleKey) {
      const newProp = {[sampleKey]: sampleKey};
      setConfig({
        ...config,
        properties: config.properties ? {...config.properties, ...newProp} : newProp
      });
    }
  };

  const onChangeProperty = (oldKey, newKey) => {
    let oldProps = {};
    if (config.properties[oldKey] !== undefined) {
      const {[oldKey]: omit, ...rest} = config.properties; //eslint-disable-line
      oldProps = rest;
    }
    else {
      oldProps = config.properties;
    }
    const newConfig = {
      ...config,
      properties: {...oldProps, [newKey]: newKey}
    };
    setConfig(newConfig);
  };

  const onChangePropertyName = (propKey, e) => {
    setConfig({
      ...config,
      properties: {...config.properties, [propKey]: e.target.value}
    });
  };

  const deleteProperty = propKey => {
    const {[propKey]: omit, ...rest} = config.properties; //eslint-disable-line
    setConfig({
      ...config,
      properties: rest
    });
  };

  if (config.path && enterPress) getMembers();

  const keys = Object.keys(sample || {}).map(d => ({value: d, label: `${d}: ${sample[d]}`}));
  const complete = ["idKey", "name", "slug", "label"].every(d => config[d]);
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
              <TextInput value={config.namespace} label="namespace" onChange={e => onChange("namespace", e.target.value)} />
              <Select value={config.idKey} label="idKey" data={keys} onChange={e => onChange("idKey", e)}></Select>
              <Select value={config.name} label="name" data={keys} onChange={e => onChange("name", e)}></Select>
              {config.properties && Object.keys(config.properties).map((propKey, i) =>
                <Group key={i}>
                  <Select value={propKey} label="property"  data={keys} onChange={e => onChangeProperty(propKey, e)}></Select>
                  <TextInput defaultValue={propKey} value={config.properties[propKey]} label="override name" onChange={e => onChangePropertyName(propKey, e)}></TextInput>
                  <Button color="red" variant="outline" onClick={() => deleteProperty(propKey)} ><HiOutlineTrash /></Button>
                </Group>
              )}
              <Button onClick={addProperty} icon={<HiOutlinePlusCircle/>}>Add Property</Button>
              <Button disabled={!complete} loading={loading} onClick={onSubmit}>{loading ? "Ingesting" : "Ingest"}</Button>
            </React.Fragment>
          }
        </Group>
      }
    </div>
  );

}

export default DimensionEditor;
