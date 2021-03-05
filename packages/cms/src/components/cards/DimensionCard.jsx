import axios from "axios";
import React, {Component, Fragment} from "react";
import {connect} from "react-redux";
import Card from "./Card";
import Dialog from "../interface/Dialog";
import DimensionEditor from "../editors/DimensionEditor";
import DefinitionList from "../variables/DefinitionList";

import {deleteDimension} from "../../actions/profiles";
import "./DimensionCard.css";

class DimensionCard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      rebuilding: false,
      alertObj: false,
      isOpen: false,
      newSlugs: false
    };
  }

  maybeRebuildSearch() {
    const {newSlugs} = this.state;
    const alertObj = {
      callback: this.rebuildSearch.bind(this),
      title: "Rebuild Search Members?",
      description: <label className="cms-checkbox-label u-font-xs">
        <input
          className="cms-checkbox"
          type="checkbox"
          checked={newSlugs}
          onChange={this.toggleSlugs.bind(this)}
        />
        &nbsp;Select this box to rebuild slugs from source data (This may change permalinks).
      </label>,
      confirm: "Rebuild"
    };
    this.setState({alertObj});
  }

  toggleSlugs(e) {
    this.setState({newSlugs: e.target.checked}, this.maybeRebuildSearch.bind(this));
  }

  rebuildSearch() {
    const {newSlugs} = this.state;
    const {meta} = this.props;
    const {id} = meta;
    const url = "/api/cms/repopulateSearch/";
    const timeout = 1000 * 60 * 5;
    this.setState({rebuilding: true, alertObj: false, newSlugs: false});
    axios.post(url, {id, newSlugs}, {timeout}).then(() => {
      this.setState({rebuilding: false});
    });
  }

  maybeDelete() {
    const alertObj = {
      callback: this.delete.bind(this),
      title: "Delete dimension?",
      description: "This action can break the site.",
      confirm: "Delete dimension"
    };
    this.setState({alertObj});
  }

  delete() {
    this.props.deleteDimension(this.props.meta.id);
  }

  render() {
    const {meta} = this.props;
    const {rebuilding, alertObj, isOpen} = this.state;
    const allowed = meta.visible;

    // define props for Card
    const cardProps = {
      title: meta.dimension,
      allowed,
      type: "dimension",
      onDelete: this.maybeDelete.bind(this),
      onRefresh: this.maybeRebuildSearch.bind(this),
      onEdit: () => this.setState({isOpen: !this.state.isOpen}),
      rebuilding,
      alertObj,
      onAlertCancel: () => this.setState({alertObj: false})
    };

    const dialogProps = {
      className: "cms-dimension-editor-dialog",
      title: "Dimension editor",
      isOpen,
      onClose: () => this.setState({isOpen: false}),
      usePortal: false,
      icon: false,
      portalProps: {namespace: "cms"}
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
            {label: "cube", text: meta.cubeName}
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
  deleteDimension: id => dispatch(deleteDimension(id))
});

export default connect(mapStateToProps, mapDispatchToProps)(DimensionCard);
