import React from "react";

import BaseSelect from "./BaseSelect";

class AreaSidebar extends React.PureComponent {
  render() {
    return (
      <div className="area-sidebar">
        <div className="wrapper">
          <BaseSelect items={[]} />
        </div>
      </div>
    );
  }
}

export default AreaSidebar;
