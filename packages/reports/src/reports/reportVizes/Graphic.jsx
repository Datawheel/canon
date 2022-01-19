import axios from "axios";
import React, {useState, useEffect} from "react";
import Stat from "../blocks/types/renderers/Stat";
import "./Graphic.css";

/** */
export default function Graphic({config, dataFormat}) {

  const [builtConfig, setBuiltConfig] = useState();

  useEffect(() => {

    const defaults = {
      numberFormat: (d, value, total) => {
        const perc = Number(d[value] / total * 100);
        return isNaN(perc) ? "No Data" : `${perc.toFixed(2)}%`;
      }
    };

    const builtConfig = {...defaults, ...config};

    // prevent the page from white screening when config/data is malformed
    if (!builtConfig || !builtConfig.data) {
      console.log("no config/data");
    }
    // If the data is an API call, run the axios get and replace .data with its results
    else if (typeof builtConfig.data === "string") {
      axios.get(builtConfig.data).then(resp => {
        builtConfig.data = dataFormat(resp.data);
        if (typeof builtConfig.data === "object" && !(builtConfig.data instanceof Array)) builtConfig = Object.assign(builtConfig, builtConfig.data);
        if (!builtConfig.total) builtConfig.total = builtConfig.data.reduce((acc, d) => isNaN(d[builtConfig.value]) ? acc : acc + Number(d[builtConfig.value]), 0);
        setBuiltConfig(builtConfig);
      });
    }
    else {
      builtConfig.data = dataFormat(builtConfig.data);
      if (typeof builtConfig.data === "object" && !(builtConfig.data instanceof Array)) builtConfig = Object.assign(builtConfig, builtConfig.data);
      if (!builtConfig.total) builtConfig.total = builtConfig.data.reduce((acc, d) => isNaN(d[builtConfig.value]) ? acc : acc + Number(d[builtConfig.value]), 0);
      setBuiltConfig(builtConfig);
    }
  }, [config]);

  if (!builtConfig) return null;

  return (
    <div className="cp-graphic">
      {builtConfig.imageURL &&
        <img src={builtConfig.imageURL} className="cp-graphic-img" alt="" />
      }
      {builtConfig.value &&
        <Stat
          label={builtConfig.label}
          value={builtConfig.value}
          subtitle={builtConfig.subtitle}
        />
      }
    </div>
  );
}
