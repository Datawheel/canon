import {Position, Toaster} from "@blueprintjs/core";
import {isWindowAvailable} from "../helpers/constants";

export const UIToaster = isWindowAvailable
  ? Toaster.create({className: "area-toaster", position: Position.TOP})
  : null;
