import React, {Component, Fragment} from "react";
import {connect} from "react-redux";
import PreviewSearch from "../components/fields/PreviewSearch";
import DimensionCard from "../components/cards/DimensionCard";
import DimensionEditor from "../components/editors/DimensionEditor";
import Deck from "../components/interface/Deck";
import Dialog from "../components/interface/Dialog";

import "./DimensionBuilder.css";

class DimensionBuilder extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: false
    };
  }

  render() {
    const {previews} = this.props.status;
    const {meta} = this.props;
    const {isOpen} = this.state;

    const groupedMeta = meta.reduce((acc, d) => {
      if (!acc[d.ordering]) acc[d.ordering] = [];
      acc[d.ordering].push(d);
      return acc;
    }, []);

    return (
      <Fragment>
        {
          groupedMeta.map((group, i) => 
            <Deck
              key={`group-${i}`}
              title={`Dimension ${i + 1}`}
              entity="dimension"
              addItem={() => this.setState({isOpen: !this.state.isOpen})}
              cards={group.map(m =>
                <DimensionCard
                  key={`dc-${m.id}`}
                  meta={m}
                />
              )}
            >
              <PreviewSearch
                label={previews[i].name || previews[i].id || "search profiles..."}
                previewing={previews[i].name || previews[i].id}
                fontSize="xxs"
                meta={group}
                index={i}
                limit={20}
              />
            </Deck>
          )
        }

        <Dialog
          className="cms-dimension-editor-dialog"
          title="Dimension editor"
          isOpen={isOpen}
          onClose={() => this.setState({isOpen: false})}
          usePortal={false}
          icon={false}
        >
          <DimensionEditor
            onComplete={() => this.setState({isOpen: false})}
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
