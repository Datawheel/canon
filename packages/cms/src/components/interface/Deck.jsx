import React, {Component} from "react";
import {Icon} from "@blueprintjs/core";
import Button from "../fields/Button";
import "./Deck.css";

/** Accordion + Cards = Deck */
export default class Deck extends Component {
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

    const title = this.props.title || "missing `title` prop in Deck.jsx";
    const entity = this.props.entity || title.toLowerCase();

    let inToolbox = false;
    if (entity === "generator" || entity === "materializer" || entity === "formatter" || entity === "selector") {
      inToolbox = true;
    }

    return (
      <section className={`cms-deck cms-${entity}-deck ${isOpen ? "is-open" : "is-collapsed"}`}>

        {/* deck title */}
        <h2 className="cms-deck-heading u-font-md" id={entity}>
          <button className="cms-deck-button u-font-sm" onClick={this.toggleAccordion.bind(this)}>
            {title}
            <span className="u-visually-hidden"> ({isOpen ? "collapse" : "open"} section)</span>
            <Icon className="cms-deck-button-icon" icon="caret-down" />
          </button>
          {(cards && cards.length > 0 && addItem) || inToolbox === true
            ? <Button onClick={addItem} className="cms-deck-heading-add-button" fontSize="xxs" context="cms" icon="plus">
              add {entity === "description" ? "paragraph" : entity}
            </Button>
            : null
          }
        </h2>

        {/* optional description */}
        {description &&
          <div className="cms-card-container">
            <p className="cms-card cms-deck-description u-font-xs">
              {description}
            </p>
          </div>
        }

        {/* cards */}
        {subtitle &&
          <h3 className="cms-deck-subtitle u-font-xs">{subtitle}</h3>
        }
        {cards &&
          <div className={`cms-card-container${secondaryCards ? " two-columns" : ""}`}>
            {cards && (cards.length || entity === "splash" || entity === "story" || entity === "title")
              ? <div className="cms-card-list">
                {cards || "missing `cards` prop in Section.jsx — card component or array of card components expected"}
              </div>
              : addItem && !inToolbox &&
                <Button
                  className="cms-deck-big-button"
                  context="cms"
                  onClick={addItem}
                  icon="plus"
                  iconPosition="right"
                >
                  Add first {entity === "description" ? "paragraph" : entity}
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
