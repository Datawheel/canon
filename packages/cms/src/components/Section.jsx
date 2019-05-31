import React, {Component} from "react";
import "./Section.css";

export default class Section extends Component {
  render() {
    const {addItem, cards, description, secondaryCards} = this.props;

    const title = this.props.title || "missing `title` prop in Section.jsx";
    const entity = this.props.entity || title.toLowerCase();

    return (
      <section className={`cms-section cms-${entity}-section`}>

        {/* section title */}
        <h2 className="cms-section-heading" id={entity}>
          {title}
          {cards && cards.length > 0 && addItem || entity === "formatter"
            ? <button className="cms-button cms-section-heading-button" onClick={addItem}>
              <span className="bp3-icon bp3-icon-plus" />
              <span className="u-visually-hidden">add {entity}</span>
            </button>
            : null
          }
        </h2>

        {/* optional description */}
        {description &&
          <p className="cms-section-description">{description}</p>
        }

        {/* cards */}
        <div className="cms-card-container">
          <div className="cms-card-list">
            {cards || "missing `cards` prop in Section.jsx — card component or array of card components expected"}
          </div>

          {/* TODO: remove once all cards display both languages */}
          {secondaryCards &&
            <div className="cms-card-list">
              {secondaryCards}
            </div>
          }
        </div>

        {cards && cards.length === 0 && addItem && entity !== "formatter" &&
          <button className="cms-button cms-section-big-button is-block" onClick={addItem}>
            add {entity}
          </button>
        }
      </section>
    );
  }
}
