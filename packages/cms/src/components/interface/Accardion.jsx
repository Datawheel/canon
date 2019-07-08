import React, {Component} from "react";
import {Icon} from "@blueprintjs/core";
import Button from "../fields/Button";
import "./Accardion.css";

/** Accordion + Cards = Accardion */
export default class Accardion extends Component {
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

    const title = this.props.title || "missing `title` prop in Accardion.jsx";
    const entity = this.props.entity || title.toLowerCase();

    let inToolbox = false;
    if (entity === "generator" || entity === "materializer" || entity === "formatter" || entity === "selector") {
      inToolbox = true;
    }

    return (
      <section className={`cms-accardion cms-${entity}-accardion ${isOpen ? "is-open" : "is-collapsed"}`}>

        {/* accardion title */}
        <h2 className="cms-accardion-heading font-md" id={entity}>
          <button className="cms-accardion-button font-sm" onClick={this.toggleAccordion.bind(this)}>
            {title}
            <span className="u-visually-hidden"> ({isOpen ? "collapse" : "open"} section)</span>
            <Icon className="cms-accardion-button-icon" icon="caret-down" />
          </button>
          {(cards && cards.length > 0 && addItem) || inToolbox === true
            ? <Button onClick={addItem} className="cms-accardion-heading-add-button font-xxs" context="cms" icon="plus">
              add {entity}
            </Button>
            : null
          }
        </h2>

        {/* optional description */}
        {description &&
          <div className="cms-card-container">
            <p className="cms-card cms-accardion-description font-xs">
              {description}
            </p>
          </div>
        }

        {/* cards */}
        {subtitle &&
          <h3 className="cms-accardion-subtitle font-sm">{subtitle}</h3>
        }
        {cards &&
          <div className={`cms-card-container${secondaryCards ? " two-columns" : ""}`}>
            {cards && (cards.length || entity === "splash" || entity === "story" || entity === "title")
              ? <div className="cms-card-list">
                {cards || "missing `cards` prop in Section.jsx — card component or array of card components expected"}
              </div>
              : addItem && !inToolbox &&
                <Button
                  className="cms-accardion-big-button"
                  context="cms"
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
        }
        {children}
      </section>
    );
  }
}
