import React, {Component, Fragment} from "react";
import {connect} from "react-redux";
import PreviewSearch from "../components/fields/PreviewSearch";
import DimensionCard from "../components/cards/DimensionCard";
import DimensionEditor from "../components/editors/DimensionEditor";
import Deck from "../components/interface/Deck";
import Dialog from "../components/interface/Dialog";
import groupMeta from "../utils/groupMeta";
import Button from "../components/fields/Button";
import {Switch} from "@blueprintjs/core";

import "./DimensionBuilder.css";

class DimensionBuilder extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: false,
      ordering: undefined,
      compact: true
    };
  }

  addVariant(ordering) {
    this.setState({isOpen: true, ordering});
  }

  toggleCompact(e) {
    this.setState({compact: e.target.checked});
  }

  render() {
    const {previews} = this.props.status;
    const {meta} = this.props;
    const {isOpen, ordering, compact} = this.state;

    const groupedMeta = groupMeta(meta);

    return (
      <Fragment>
        <Deck
          title={
            <span>
              Dimensions
              <Switch
                checked={compact}
                className={"cms-variable-editor-switcher u-font-xxs cms-generator-variable-editor-switcher"}
                label="Compact"
                inline={true}
                onChange={this.toggleCompact.bind(this)}
              />
            </span>
          }
          entity="dimension"
          addItem={() => this.setState({isOpen: !this.state.isOpen})}
          cards={groupedMeta.map((group, i) =>
            <div key={`group-${i}`}>
              {!compact ? group.map(meta =>
                <DimensionCard
                  key={`meta-${meta.id}`}
                  meta={meta}
                />
              ) : []}
              <PreviewSearch
                label={previews[i] ? previews[i].name || previews[i].id || "search profiles..." : "search profiles..."}
                previewing={previews[i] ? previews[i].name || previews[i].id : false}
                fontSize="xxs"
                group={group}
                index={i}
                limit={20}
              />
              {!compact && <Button onClick={this.addVariant.bind(this, i)} className="cms-deck-heading-add-button" fontSize="xxs" namespace="cms" icon="plus" fill={true}>
                Add Variant
              </Button>}
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
