import axios from "axios";
import React, {Component} from "react";
import Search from "../Search/Search.jsx";
import {Alert, Intent} from "@blueprintjs/core";
import "./DimensionCard.css";

export default class DimensionCard extends Component {

  constructor(props) {
    super(props);
    this.state = {
      rebuilding: false,
      alertObj: false
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
        if (this.props.onDeleteDimension) this.props.onDeleteDimension(profiles);
      }
    });
  }

  render() {
    const {meta, preview} = this.props;
    const {rebuilding, alertObj} = this.state;

    if (!preview) return null;

    return (
      <div className="cms-card cms-dimension-card">
        <Alert
          cancelButtonText="Cancel"
          confirmButtonText={alertObj.confirm}
          className="cms-confirm-alert"
          iconName="bp3-icon-warning-sign"
          intent={Intent.DANGER}
          isOpen={alertObj}
          onConfirm={alertObj.callback}
          onCancel={() => this.setState({alertObj: false})}
        >
          {alertObj.message}
        </Alert>
        <table className="cms-dimension-card-table">
          <tbody>
            <tr className="cms-dimension-card-table-row">
              <th className="cms-dimension-card-table-cell">slug</th>
              <th className="cms-dimension-card-table-cell">Dimension</th>
              <th className="cms-dimension-card-table-cell">Levels</th>
              <th className="cms-dimension-card-table-cell">Measure</th>
              <th className="cms-dimension-card-table-cell">Preview ID</th>
            </tr>
          </tbody>
          <tbody>
            <tr className="cms-dimension-card-table-row">
              <td className="cms-dimension-card-table-cell">{meta.slug}</td>
              <td className="cms-dimension-card-table-cell">{meta.dimension}</td>
              <td className="cms-dimension-card-table-cell">
                {meta.levels.length === 1
                  ? meta.levels
                  : <ul className="cms-dimension-card-table-list">
                    {meta.levels.map(level =>
                      <li className="cms-dimension-card-table-item" key={level}>{level}</li>
                    )}
                  </ul>
                }
              </td>
              <td className="cms-dimension-card-table-cell">{meta.measure}</td>
              <td className="cms-dimension-card-table-cell">{preview.id}</td>
            </tr>
          </tbody>
        </table>
        <div className="dimension-card-controls">
          <div>{/* <label> causes dropdown to stay open; TODO: revisit */}
            Preview profile
            <Search
              render={d => <span onClick={this.onSelectPreview.bind(this, d)}>{d.name}</span>}
              dimension={meta.dimension}
              levels={meta.levels}
              limit={20}
            />
          </div>
          <button className="cms-button" disabled={rebuilding} onClick={this.rebuildSearch.bind(this)}>
            {rebuilding ? "Rebuilding..." : "Rebuild"}
          </button>
          <button className="cms-button" disabled={rebuilding} onClick={this.maybeDelete.bind(this)}>
            Delete
          </button>
        </div>
      </div>
    );
  }

}
