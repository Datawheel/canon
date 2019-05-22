import React, {Component} from "react";
import DimensionCard from "../components/cards/DimensionCard";

import "./DimensionBuilder.css";

export default class DimensionBuilder extends Component {

  constructor(props) {
    super(props);
    this.state = {
    };
  }

  componentDidMount() {
  }

  onSelectPreview(slug, id) {
    if (this.props.onSelectPreview) this.props.onSelectPreview(slug, id);
  }

  render() {
    const {meta, previews} = this.props;

    return (
      <div className="dimension-editor">
        {meta.map((m, i) => 
          <DimensionCard
            key={`dc-${i}`}
            meta={meta[i]}
            preview={previews[i]}
            onSelectPreview={this.onSelectPreview.bind(this)}
          />
        )}
      </div>
    );
  }

}
