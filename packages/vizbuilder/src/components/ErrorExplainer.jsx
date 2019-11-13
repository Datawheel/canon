import React from "react";

/** @type {React.FC<import("react-i18next").WithNamespaces & {error: string}>} */
const ErrorExplainer = function({error}) {
  if (charts.length === 0) {
    return (
      <div className="wrapper chart-wrapper empty">
        <NonIdealState
          icon="error"
          title="No charts could be computed with these parameters."
          description="This is probably an issue with vizbuilder. Please file an issue indicating the set of parameters that outputted this result."
          action={
            <AnchorButton
              text="File an issue"
              href="https://github.com/Datawheel/canon/issues/new"
            />
          }
        />
      </div>
    );
  }
}

export default withNamespaces()(ErrorExplainer);
