import React from "react";

import MultiLevelSelect from "./MultiLevelSelect";

class CommonSelect extends MultiLevelSelect {
  renderTarget(item) {
    const valueLabel = item.caption || item.name;
    return (
      <div className="select-option current" title={valueLabel}>
        <span className="value">{valueLabel}</span>
        <span className="pt-icon-standard pt-icon-double-caret-vertical" />
      </div>
    );
  }
}

CommonSelect.displayName = "CommonSelect";
CommonSelect.defaultProps = {
  ...MultiLevelSelect.defaultProps,
  filterable: false,
  getItemHeight() {
    return 28;
  }
};

export default CommonSelect
