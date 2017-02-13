import React, {Component} from "react";

class Stat extends Component {

  render() {
    const {label, value} = this.props;
    return (
      <div className="stat">
        <div className="label">{ label }</div>
        <div className="value">{ value }</div>
      </div>
    );
  }

}

Stat.defaultProps = {
  label: "Stat",
  value: "N/A"
};

export default Stat;
