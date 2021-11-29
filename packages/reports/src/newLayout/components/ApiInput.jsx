/* react */
import React, {useState} from "react";

/* components */
import {TextInput} from "@mantine/core";

/* utils */
import varSwap from "../../utils/varSwap";

/** */
function ApiInput({defaultValue, onChange, variables}) {

  const [preview, setPreview] = useState(() => varSwap(defaultValue, {}, variables));

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

