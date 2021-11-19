/* react */
import React, {useState} from "react";

/* components */
import {TextInput} from "@mantine/core";

/* utils */
import urlSwap from "../../utils/urlSwap";

/** */
function ApiInput({defaultValue, onChange, variables}) {

  const [preview, setPreview] = useState(() => urlSwap(defaultValue, variables));

  const onChangeLocal = e => {
    setPreview(urlSwap(e.target.value, variables));
    onChange(e);
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

