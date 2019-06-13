import React from "react";
import {Button} from "@blueprintjs/core";

class ChartCard extends React.PureComponent {
  constructor(props) {
    super(props);
    this.handleToggleSelect = this.handleToggleSelect.bind(this);
  }

  handleToggleSelect() {
    this.props.onSelect(this.props.name);
  }

  render() {
    const {active} = this.props;

    return (
      <div className="chart-card">
        <div className="wrapper">
          {this.props.children}
          {!this.props.hideFooter && (
            <footer>
              <Button
                className="bp3-minimal"
                iconName={active ? "cross" : "zoom-in"}
                text={active ? "CLOSE" : "ENLARGE"}
                onClick={this.handleToggleSelect}
              />
            </footer>
          )}
        </div>
      </div>
    );
  }
}

export default ChartCard;
