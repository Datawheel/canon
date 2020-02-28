import React, {Component, Fragment} from "react";
import {connect} from "react-redux";
import PreviewSearch from "../components/fields/PreviewSearch";
import DimensionCard from "../components/cards/DimensionCard";
import DimensionEditor from "../components/editors/DimensionEditor";
import Deck from "../components/interface/Deck";
import Dialog from "../components/interface/Dialog";
import groupMeta from "../utils/groupMeta";
import Button from "../components/fields/Button";

import "./DimensionBuilder.css";

class DimensionBuilder extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: false,
      ordering: undefined
    };
  }

  addVariant(ordering) {
    this.setState({isOpen: true, ordering});
  }

  render() {
    const {previews} = this.props.status;
    const {meta} = this.props;
    const {isOpen, ordering} = this.state;

    const groupedMeta = groupMeta(meta);

    return (
      <Fragment>
        <Deck
          title="Dimensions"
          entity="dimension"
          addItem={() => this.setState({isOpen: !this.state.isOpen})}
          cards={groupedMeta.map((group, i) =>
            <div key={`group-${i}`}>
              {group.map(meta => 
                <DimensionCard
                  key={`meta-${meta.id}`}
                  meta={meta}
                />
              )}
              <PreviewSearch
                label={previews[i] ? previews[i].name || previews[i].id || "search profiles..." : "search profiles..."}
                previewing={previews[i] ? previews[i].name || previews[i].id : false}
                fontSize="xxs"
                group={group}
                index={i}
                limit={20}
              />
              <Button onClick={this.addVariant.bind(this, i)} className="cms-deck-heading-add-button" fontSize="xxs" namespace="cms" icon="plus">
                Add Variant
              </Button>
            </div>
          )}
        />

        <Dialog
          className="cms-dimension-editor-dialog"
          title="Dimension editor"
          isOpen={isOpen}
          onClose={() => this.setState({isOpen: false})}
          usePortal={false}
          icon={false}
        >
          <DimensionEditor
            onComplete={() => this.setState({isOpen: false, ordering: undefined})}
            ordering={ordering}
          />
        </Dialog>
      </Fragment>
    );
  }
}

const mapStateToProps = state => ({
  status: state.cms.status,
  meta: state.cms.profiles.find(p => p.id === state.cms.status.currentPid).meta
});

export default connect(mapStateToProps)(DimensionBuilder);
