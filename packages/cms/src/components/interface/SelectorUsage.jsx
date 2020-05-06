import {connect} from "react-redux";
import React, {Component} from "react";
import Select from "../fields/Select";
import Button from "../fields/Button";
import stripHTML from "../../utils/formatters/stripHTML";
import validateDynamic from "../../utils/selectors/validateDynamic";
import scaffoldDynamic from "../../utils/selectors/scaffoldDynamic";

import {newEntity, deleteEntity, swapEntity} from "../../actions/profiles";
import {setStatus} from "../../actions/status";

import "./SelectorUsage.css";

class SelectorUsage extends Component {

  constructor(props) {
    super(props);
    this.state = {
      currentValues: {},
      showMore: false
    };
  }

  removeItem(id) {
    const {minData} = this.props;
    this.props.deleteEntity("section_selector", {section_id: minData.id, selector_id: id});
  }

  addItem(id) {
    const {minData} = this.props;
    this.props.newEntity("section_selector", {section_id: minData.id, selector_id: id});
  }

  onChange(name, e) {
    const {currentValues} = this.state;
    currentValues[name] = e.target.value;
    this.setState({currentValues});
    const selectionObj = {[name]: e.target.value};
    this.props.setStatus({query: Object.assign({}, this.props.status.query, selectionObj)});
  }

  swapSelector(id) {
    this.props.swapEntity("section_selector", id);
  }

  render() {

    const {currentValues, showMore} = this.state;
    const {localeDefault} = this.props.status;
    const variables = this.props.status.variables[localeDefault];
    const {minData, allSelectors} = this.props;

    if (!minData) return null;

    const {selectors} = minData;

    // Scaffold dynamic selectors;
    const activeSelectors = selectors.map(selector => {
      if (selector.dynamic) {
        if (validateDynamic(variables[selector.dynamic]) === "valid") {
          return {...selector, options: scaffoldDynamic(variables[selector.dynamic])};
        } 
        else return {...selector, options: []};
      }
      else return selector;
    });
    const inactiveSelectors = [];

    allSelectors.forEach(selector => {
      if (!selectors.map(s => s.id).includes(selector.id)) {
        inactiveSelectors.push(selector);
      }
    });

    const inactiveSelectorsVisible = showMore ? inactiveSelectors : inactiveSelectors.slice(0, 3);

    activeSelectors.sort((a, b) => a.ordering - b.ordering);

    return (
      <div className="cms-selector-usage cms-card-container">

        <div className="cms-selector-usage-column">
          <h3 className="cms-selector-usage-heading u-font-sm">Inactive selectors</h3>
          {inactiveSelectorsVisible.length
            ? <ul className="cms-selector-usage-list">
              {inactiveSelectorsVisible.map(s =>
                <li className="cms-selector-usage-item" key={s.id}>
                  <label className="cms-selector-usage-item-label u-font-xs">
                    {s.name}
                    <Button
                      className="cms-selector-usage-item-button"
                      fontSize="xxxs"
                      namespace="cms"
                      icon="plus"
                      iconOnly
                      onClick={this.addItem.bind(this, s.id)}
                    >
                      (Make active)
                    </Button>
                  </label>
                </li>
              )}
            </ul>
            : <p className="u-font-xs">All available selectors have been activated</p>
          }
          {(showMore || inactiveSelectors.length > inactiveSelectorsVisible.length) && 
            <Button 
              fontSize="xxs"
              onClick={() => this.setState({showMore: !this.state.showMore})}
            >
              {showMore ? "Hide Full List" : "Show Full List..."} 
            </Button>
          }
        </div>

        <div className="cms-selector-usage-column">
          <h3 className="cms-selector-usage-heading u-font-sm">Active selectors</h3>

          {activeSelectors.length
            ? <ol className="cms-selector-usage-list">

              {activeSelectors.map((s, i) =>
                <li className="cms-card cms-selector-card" key={`${s.id}-usage-card`}>

                  {/* header */}
                  <div className="cms-card-heading">
                    <h3 className="cms-card-heading-text u-font-xs">{s.name}</h3>
                    <div className="cms-button-group">
                      <Button
                        className="cms-card-heading-button"
                        fontSize="xxxs"
                        namespace="cms"
                        onClick={this.removeItem.bind(this, s.id)}
                        icon="cross"
                        iconOnly
                      >
                        remove {s.name} from active selectors
                      </Button>
                    </div>
                  </div>

                  {s.options.length > 0 &&
                    <Select
                      label={s.title}
                      fontSize="xs"
                      namespace="cms"
                      value={currentValues[s.name]}
                      onChange={this.onChange.bind(this, s.name)}
                    >
                      {s.options.map(option =>
                        <option
                          key={`select-option-${option.option}`}
                          value={option.option}
                        >
                          {typeof variables[option.option] === "object"
                            ? stripHTML(JSON.stringify(variables[option.option]))
                            : stripHTML(option.label || variables[option.option])}
                        </option>
                      )}
                    </Select>
                  }

                  {i !== activeSelectors.length - 1 &&
                    <div className="cms-reorder">
                      <Button
                        onClick={this.swapSelector.bind(this, s.section_selector.id)}
                        className="cms-reorder-button"
                        namespace="cms"
                        icon="swap-vertical"
                        iconOnly
                      >
                        Swap positioning of current and next selector
                      </Button>
                    </div>
                  }
                </li>
              )}
            </ol>
            : <p className="u-font-xs">No selectors are currently activated</p>
          }
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  status: state.cms.status,
  allSelectors: state.cms.profiles.find(p => p.id === state.cms.status.currentPid).selectors
});

const mapDispatchToProps = dispatch => ({
  setStatus: status => dispatch(setStatus(status)),
  newEntity: (type, payload) => dispatch(newEntity(type, payload)),
  deleteEntity: (type, payload) => dispatch(deleteEntity(type, payload)),
  swapEntity: (type, id) => dispatch(swapEntity(type, id))
});

export default connect(mapStateToProps, mapDispatchToProps)(SelectorUsage);
