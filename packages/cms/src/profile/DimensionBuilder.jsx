import React, {Component} from "react";
import DimensionCard from "../components/cards/DimensionCard";
import DimensionCreator from "../components/DimensionCreator";
import FooterButtons from "../components/FooterButtons";
import {Button, Dialog} from "@blueprintjs/core";

import "./DimensionBuilder.css";

export default class DimensionBuilder extends Component {

  constructor(props) {
    super(props);
    this.state = {
    };
  }

  componentDidMount() {
  }

  onSelectPreview(slug, id) {
    if (this.props.onSelectPreview) this.props.onSelectPreview(slug, id);
  }

  onAddDimension(d) {
    if (this.props.onAddDimension) this.props.onAddDimension(d);
    this.setState({isOpen: false});
  }

  render() {
    const {meta, previews} = this.props;
    const {isOpen} = this.state;

    return (
      <div className="dimension-builder">
        <p className="dimension-builder-label pt-label">Dimensions</p>
        {meta.length
          ? <div className="cms-card-list dimension-card-list">
            {meta.map((m, i) =>
              <DimensionCard
                key={`dc-${i}`}
                meta={meta[i]}
                preview={previews[i]}
                onSelectPreview={this.onSelectPreview.bind(this)}
              />
            )}
          </div> : null
        }

        <button
          className="cms-button is-block"
          onClick={() => this.setState({isOpen: !this.state.isOpen})}
        >
          Add Dimension
        </button>

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
              cubeData={this.props.cubeData}
              onAddDimension={this.onAddDimension.bind(this)}
            />
          </div>
        </Dialog>
      </div>
    );
  }

}
