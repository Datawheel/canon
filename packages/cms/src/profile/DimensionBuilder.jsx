import React, {Component} from "react";
import DimensionCard from "../components/cards/DimensionCard";
import DimensionCreator from "../components/DimensionCreator";
import Deck from "../components/interface/Deck";
import {Dialog} from "@blueprintjs/core";

import "./DimensionBuilder.css";

export default class DimensionBuilder extends Component {

  constructor(props) {
    super(props);
    this.state = {
    };
  }

  componentDidMount() {
  }

  onAddDimension(d) {
    if (this.props.onAddDimension) this.props.onAddDimension(d);
    this.setState({isOpen: false});
  }

  onDeleteDimension(profiles) {
    if (this.props.onDeleteDimension) this.props.onDeleteDimension(profiles);
    this.setState({isOpen: false});
  }

  render() {
    const {meta, previews, takenSlugs} = this.props;
    const {isOpen} = this.state;

    return (
      <React.Fragment>
        <Deck
          title="Dimensions"
          entity="dimension"
          addItem={() => this.setState({isOpen: !this.state.isOpen})}
          cards={meta.map((m, i) =>
            <DimensionCard
              key={`dc-${i}`}
              meta={meta[i]}
              preview={previews[i]}
              onDeleteDimension={this.onDeleteDimension.bind(this)}
            />
          )}
        />

        <Dialog
          className="dimension-editor-dialog"
          isOpen={isOpen}
          onClose={() => this.setState({isOpen: false})}
          title="Dimension Creator"
          usePortal={false}
          icon={false}
        >

          <div className="bp3-dialog-body">
            <DimensionCreator
              takenSlugs={takenSlugs}
              cubeData={this.props.cubeData}
              onAddDimension={this.onAddDimension.bind(this)}
            />
          </div>
        </Dialog>
      </React.Fragment>
    );
  }

}
