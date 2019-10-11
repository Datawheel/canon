import axios from "axios";
import React, {Component} from "react";
import Button from "../fields/Button";
import DefinitionList from "../variables/DefinitionList";
import DimensionEditor from "../editors/DimensionEditor";
import {Dialog} from "@blueprintjs/core";
import PropTypes from "prop-types";
import PreviewSearch from "../fields/PreviewSearch";
import Card from "./Card";
import "./DimensionCard.css";

class DimensionCard extends Component {

  constructor(props) {
    super(props);
    this.state = {
      rebuilding: false,
      alertObj: false,
      isOpen: false
    };
  }

  onSelectPreview(result) {
    // todo bivariate - should this slug come from preview or meta? once the user
    // is able to change slug, one of these will have to become the source of truth
    const {slug} = this.props.preview;
    const {id, name, slug: memberSlug} = result;
    const newPreview = {slug, id, name, memberSlug};
    this.context.onSelectPreview(newPreview);
  }

  rebuildSearch() {
    const {meta} = this.props;
    const {id} = meta;
    const url = "/api/cms/repopulateSearch/";
    this.setState({rebuilding: true});
    axios.post(url, {id}).then(() => {
      this.setState({rebuilding: false});
    });
  }

  maybeDelete() {
    const alertObj = {
      callback: this.delete.bind(this),
      message: "Are you sure you want to delete this Dimension?",
      confirm: "Delete"
    };
    this.setState({alertObj});
  }

  delete() {
    const {meta} = this.props;
    const {id} = meta;
    axios.delete("/api/cms/profile_meta/delete", {params: {id}}).then(resp => {
      if (resp.status === 200) {
        this.setState({alertObj: false});
        const profiles = resp.data;
        this.context.onDimensionModify("delete", profiles);
      }
    });
  }

  render() {
    const {cubeData, meta, preview, takenSlugs} = this.props;
    const {rebuilding, alertObj, isOpen} = this.state;

    if (!preview) return null;

    // define props for Card
    const cardProps = {
      cardClass: "dimension",
      title: meta.dimension,
      onDelete: this.maybeDelete.bind(this),
      onRefresh: this.rebuildSearch.bind(this),
      onEdit: () => this.setState({isOpen: !this.state.isOpen}),
      rebuilding,
      // onEdit: this.openEditor.bind(this),
      // onReorder: this.props.onMove ? this.props.onMove.bind(this) : null,
      // alert
      alertObj,
      onAlertCancel: () => this.setState({alertObj: false})
    };

    return (
      <React.Fragment>
        <Card key={`dimcard-${meta.slug}`} {...cardProps}>

          <DefinitionList definitions={[
            {label: "slug", text: meta.slug},
            {label: "levels", text: meta.levels.join(", ")},
            {label: "measure", text: meta.measure},
            {label: "preview ID", text:
              <PreviewSearch
                label={preview.name || preview.id || "search profiles..."}
                previewing={preview.name || preview.id}
                fontSize="xxs"
                renderResults={d =>
                  <Button
                    className="cms-search-result-button"
                    namespace="cms"
                    fontSize="xxs" onClick={this.onSelectPreview.bind(this, d)}
                  >
                    {d.name}
                  </Button>
                }
                dimension={meta.dimension}
                levels={meta.levels}
                limit={20}
              />
            }
          ]}/>

          {/* TODO: edit mode */}
        </Card>
        <Dialog
          key="dimension-editor-dialog"
          className="dimension-editor-dialog"
          isOpen={isOpen}
          onClose={() => this.setState({isOpen: false})}
          title="Dimension Creator"
          usePortal={false}
          icon={false}
        >

          <div className="bp3-dialog-body">
            <DimensionEditor
              meta={meta}
              takenSlugs={takenSlugs}
              cubeData={cubeData}
              onComplete={() => this.setState({isOpen: false})}
            />
          </div>
        </Dialog>
      </React.Fragment>
    );
  }

}

DimensionCard.contextTypes = {
  onSelectPreview: PropTypes.func,
  onDimensionModify: PropTypes.func
};

export default DimensionCard;
