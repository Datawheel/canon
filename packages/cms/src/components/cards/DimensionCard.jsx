import axios from "axios";
import React, {Component} from "react";
import Search from "../Search/Search.jsx";
import {Button} from "@blueprintjs/core";

export default class DimensionCard extends Component {

  constructor(props) {
    super(props);
    this.state = {
    };
  }

  componentDidMount() {
  }

  onSelectPreview(result) {
    // todo bivariate - should this slug come from preview or meta? once the user
    // is able to change slug, one of these will have to become the source of truth
    const {slug} = this.props.preview;
    const {id} = result;
    if (this.props.onSelectPreview) this.props.onSelectPreview(slug, id);
  }

  rebuildSearch() {
    const {meta} = this.props;
    const url = "/api/cms/repopulateSearch";

    const payload = {
    };
    
  }

  render() {
    const {meta, preview} = this.props;

    if (!preview) return null;

    return (
      <div className="cms-card">
        <Button icon="refresh" onClick={this.rebuildSearch.bind(this)}>Rebuild Search Data</Button>
        slug: <strong>{meta.slug}</strong>
        Dimension: <strong>{meta.dimension}</strong>
        Levels: <strong>{meta.levels.join()}</strong>
        Measure: <strong>{meta.measure}</strong>
        Preview ID: <strong>{preview.id}</strong>
        <Search
          render={d => <span onClick={this.onSelectPreview.bind(this, d)}>{d.name}</span>}
          dimension={meta.dimension}
          levels={meta.levels}
          limit={20}
        />
      </div>
    );
  }

}
