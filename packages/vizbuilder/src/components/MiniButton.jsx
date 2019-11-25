import {Button, Intent} from "@blueprintjs/core";
import React from "react";

/** @type {React.FC<import("@blueprintjs/core").IButtonProps & {primary?: boolean}>} */
const MiniButton = function({primary = false, children = undefined, ...props}) {
  return (
    <Button small intent={primary ? Intent.PRIMARY : undefined} {...props}>
      {children}
    </Button>
  );
};

export default MiniButton;
