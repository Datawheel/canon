import React, {Component} from "react";
import Button from "./Button";
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
          {title} {cards && cards.length > 0 && addItem || entity === "formatter"
            ? <Button onClick={addItem} className="cms-section-heading-button" icon="plus" iconOnly>
              Add {entity}
            </Button>
            : null
          }
        </h2>

        {/* optional description */}
        {description &&
          <p className="cms-section-description">{description}</p>
        }

        {/* cards */}
        <div className="cms-card-container">
          {cards && (cards.length || entity === "splash" || entity === "story" || entity === "title")
            ? <div className="cms-card-list">
              {cards || "missing `cards` prop in Section.jsx — card component or array of card components expected"}
            </div>
            : null
          }

          {/* TODO: remove once all cards display both languages */}
          {secondaryCards && (secondaryCards.length || entity === "splash" || entity === "story" || entity === "title")
            ? <div className="cms-card-list">
              {secondaryCards}
            </div>
            : null
          }
        </div>

        {cards && cards.length === 0 && addItem && entity !== "formatter" &&
          <Button
            className="cms-section-big-button"
            onClick={addItem}
            icon="plus"
            iconPosition="right"
           
          >
            Add {entity}
          </Button>
        }
      </section>
    );
  }
}
