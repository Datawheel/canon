import React, {Component} from "react";
import {Icon} from "@blueprintjs/core";
import Button from "./Button";
import "./Section.css";

export default class Section extends Component {
  constructor() {
    super();
    this.state = {
      isOpen: true
    };
  }

  toggleAccordion() {
    this.setState({isOpen: !this.state.isOpen});
  }

  render() {
    const {addItem, cards, children, description, secondaryCards, subtitle} = this.props;
    const {isOpen} = this.state;

    const title = this.props.title || "missing `title` prop in Section.jsx";
    const entity = this.props.entity || title.toLowerCase();

    let inToolbox = false;
    if (entity === "generator" || entity === "materializer" || entity === "formatter") {
      inToolbox = true;
    }

    return (
      <section className={`cms-section cms-${entity}-section ${isOpen ? "is-open" : "is-collapsed"}`}>

        {/* section title */}
        <h2 className="cms-section-heading font-md" id={entity}>
          <button className="cms-accordion-button font-sm" onClick={this.toggleAccordion.bind(this)}>
            {title}
            <span className="u-visually-hidden"> ({isOpen ? "collapse" : "open"} section)</span>
            <Icon className="cms-accordion-button-icon" icon="caret-down" />
          </button>
          {(cards && cards.length > 0 && addItem) || inToolbox === true
            ? <Button onClick={addItem} className="cms-section-heading-add-button font-xxs" icon="plus">
              add {entity}
            </Button>
            : null
          }
        </h2>

        {/* optional description */}
        {description &&
          <div className="cms-card-container">
            <p className="cms-card cms-section-description font-xs">
              {description}
            </p>
          </div>
        }

        {/* cards */}
        {subtitle &&
          <h3 className="cms-section-subtitle font-sm">{subtitle}</h3>
        }
        <div className={`cms-card-container${secondaryCards ? " two-columns" : ""}`}>
          {cards && (cards.length || entity === "splash" || entity === "story" || entity === "title")
            ? <div className="cms-card-list">
              {cards || "missing `cards` prop in Section.jsx — card component or array of card components expected"}
            </div>
            : addItem && !inToolbox &&
              <Button
                className="cms-section-big-button"
                onClick={addItem}
                icon="plus"
                iconPosition="right"
              >
                Add first {entity}
              </Button>
          }

          {/* TODO: remove once all cards display both languages */}
          {secondaryCards && (secondaryCards.length || entity === "splash" || entity === "story" || entity === "title")
            ? <div className="cms-card-list">
              {secondaryCards}
            </div>
            : null
          }
        </div>
        {children}
      </section>
    );
  }
}
