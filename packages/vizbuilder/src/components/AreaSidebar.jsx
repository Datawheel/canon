import React from "react";

import BaseSelect from "./BaseSelect";

class AreaSidebar extends React.PureComponent {
  render() {
    return (
      <div className="viz-areasidebar">
        <BaseSelect items={[]} />
      </div>
    );
  }
}

export default AreaSidebar;
