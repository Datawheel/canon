import axios from "axios";
import React, {Component, Fragment} from "react";
import {connect} from "react-redux";
import {Dialog} from "@blueprintjs/core";

import Card from "./Card";
import DimensionEditor from "../editors/DimensionEditor";
import DefinitionList from "../variables/DefinitionList";
import Button from "../fields/Button";
import PreviewSearch from "../fields/PreviewSearch";

import {deleteDimension} from "../../actions/profiles";
import {setStatus} from "../../actions/status";

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
    const previews = this.props.status.previews.map(p => p.slug === newPreview.slug ? newPreview : p);
    const pathObj = Object.assign({}, this.props.status.pathObj, {previews});
    this.props.setStatus({pathObj, previews});
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
    this.props.deleteDimension(this.props.meta.id);
  }

  render() {
    const {meta, preview} = this.props;
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
      alertObj,
      onAlertCancel: () => this.setState({alertObj: false})
    };

    const dialogProps = {
      className: "dimension-editor-dialog",
      title: "Dimension editor",
      isOpen,
      onClose: () => this.setState({isOpen: false}),
      usePortal: false,
      icon: false
    };

    const editorProps = {
      meta,
      onComplete: () => this.setState({isOpen: false})
    };

    return (
      <Fragment>
        <Card {...cardProps} key="c">
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
        </Card>

        {/* open state */}
        <Dialog {...dialogProps} key="d">
          <DimensionEditor {...editorProps} />
        </Dialog>
      </Fragment>
    );
  }
}

const mapStateToProps = state => ({
  status: state.cms.status
});

const mapDispatchToProps = dispatch => ({
  setStatus: status => dispatch(setStatus(status)),
  deleteDimension: id => dispatch(deleteDimension(id))
});

export default connect(mapStateToProps, mapDispatchToProps)(DimensionCard);
