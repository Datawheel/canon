/* react */
import React, {useState, useRef} from "react";

/* components */
import {TextInput} from "@mantine/core";

/* hooks */
import useKeyPress from "../hooks/listeners/useKeyPress";

/* utils */
import varSwap from "../../utils/variables/varSwap";
import {useVariables} from "../hooks/blocks/useVariables";
import {useFormatters} from "../hooks/blocks/selectors";

/** */
function ApiInput({defaultValue, id, onChange, onEnterPress}) {

  const {variables} = useVariables(id);
  const formatterFunctions = useFormatters();

  const [preview, setPreview] = useState(() => varSwap(defaultValue, formatterFunctions, variables));

  const apiRef = useRef();
  const enterPress = useKeyPress(13);
  if (document.activeElement === apiRef.current && enterPress) onEnterPress();

  const onChangeLocal = e => {
    setPreview(varSwap(e.target.value, formatterFunctions, variables));
    onChange(e.target.value);
  };

  return (
    <div>
      <TextInput
        key="text-input"
        placeholder="API"
        defaultValue={defaultValue}
        ref={apiRef}
        type="url"
        onChange={onChangeLocal}
        size="xs"
      />
      <span key="api-preview">{preview}</span>
    </div>
  );

}

export default ApiInput;

