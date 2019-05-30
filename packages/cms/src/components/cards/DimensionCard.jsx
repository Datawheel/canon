import axios from "axios";
import React, {Component} from "react";
import Search from "../Search/Search.jsx";
import "./DimensionCard.css";

export default class DimensionCard extends Component {

  constructor(props) {
    super(props);
    this.state = {
      rebuilding: false
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

  render() {
    const {meta, preview} = this.props;
    const {rebuilding} = this.state;

    if (!preview) return null;

    return (
      <div className="cms-card cms-dimension-card">
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
          <div>
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
        </div>
      </div>
    );
  }

}
