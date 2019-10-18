import React, {Component} from "react";
import DimensionCard from "../components/cards/DimensionCard";
import DimensionEditor from "../components/editors/DimensionEditor";
import Deck from "../components/interface/Deck";
import {Dialog} from "@blueprintjs/core";
import {connect} from "react-redux";

import "./DimensionBuilder.css";

class DimensionBuilder extends Component {

  constructor(props) {
    super(props);
    this.state = {
    };
  }

  render() {
    const {meta, takenSlugs} = this.props;
    const {previews} = this.props.status;
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
              takenSlugs={takenSlugs}
              meta={meta[i]}
              preview={previews[i]}
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
            <DimensionEditor
              takenSlugs={takenSlugs}
              onComplete={() => this.setState({isOpen: false})}
            />
          </div>
        </Dialog>
      </React.Fragment>
    );
  }

}

const mapStateToProps = state => ({
  status: state.cms.status
});

export default connect(mapStateToProps)(DimensionBuilder);

