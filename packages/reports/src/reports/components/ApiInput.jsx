/* react */
import React, {useState} from "react";

/* components */
import {TextInput} from "@mantine/core";

/* hooks */
import useKeyPress from "../hooks/listeners/useKeyPress";

/* utils */
import varSwap from "../../utils/varSwap";

/** */
function ApiInput({defaultValue, onChange, variables, onEnterPress}) {

  const [preview, setPreview] = useState(() => varSwap(defaultValue, {}, variables));

  const enterPress = useKeyPress(13);
  if (enterPress) onEnterPress();

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
        type="url"
        onChange={onChangeLocal}
        size="xs"
      />
      <span key="api-preview">{preview}</span>
    </div>
  );

}

export default ApiInput;

