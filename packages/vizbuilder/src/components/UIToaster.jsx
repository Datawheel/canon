import {Position, Toaster} from "@blueprintjs/core";

const isWindowAvailable = typeof window !== "undefined";

export const UIToaster = isWindowAvailable
  ? Toaster.create({className: "area-toaster", position: Position.TOP})
  : null;
