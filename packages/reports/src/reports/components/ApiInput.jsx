/* react */
import React, {useState, useRef} from "react";

/* components */
import {TextInput} from "@mantine/core";

/* hooks */
import useKeyPress from "../hooks/listeners/useKeyPress";

/* utils */
import varSwap from "../../utils/variables/varSwap";

/** */
function ApiInput({defaultValue, onChange, variables, onEnterPress}) {

  const [preview, setPreview] = useState(() => varSwap(defaultValue, {}, variables));

  const apiRef = useRef();
  const enterPress = useKeyPress(13);
  if (document.activeElement === apiRef.current && enterPress) onEnterPress();

  const onChangeLocal = e => {
    // todo1.0 put formatters in here
    setPreview(varSwap(e.target.value, {}, variables));
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

