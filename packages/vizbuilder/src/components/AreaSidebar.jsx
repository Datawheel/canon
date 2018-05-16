import React from "react";

import BaseSelect from "./BaseSelect";
// import FilterManager from './FilterManager'

class AreaSidebar extends React.PureComponent {
  pickCube = cube => {
    this.props.onQuery({ cube });
    this.props.onItems({ measures: cube.measures });
  };

  render() {
    const { cubes, measures } = this.props.items;

    return (
      <div className="area-sidebar">
        <div className="wrapper">
          <BaseSelect items={cubes} onItemSelect={this.pickCube} />
          {/* <FilterManager /> */}
        </div>
      </div>
    );
  }
}

export default AreaSidebar;
