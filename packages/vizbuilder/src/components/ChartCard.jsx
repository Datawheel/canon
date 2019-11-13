import {Button} from "@blueprintjs/core";
import React from "react";
import {withNamespaces} from "react-i18next";

/**
 * @typedef OwnProps
 * @property {boolean} active
 * @property {boolean} [hideToolbar]
 * @property {() => void} onToggle
 */

/** @type {React.FC<import("react-i18next").WithNamespaces & OwnProps>} */
const ChartCard = function({active, children, hideToolbar, t: translate, onToggle}) {
  return (
    <div className="chart-card">
      <fieldset className="wrapper">
        {!hideToolbar && (
          <legend>
            <aside className="chart-toolbar">
              <Button
                minimal
                icon={active ? "cross" : "zoom-in"}
                text={active ? translate("CLOSE") : translate("ENLARGE")}
                onClick={onToggle}
              />
            </aside>
          </legend>
        )}
        {children}
      </fieldset>
    </div>
  );
};

export default withNamespaces()(ChartCard);
