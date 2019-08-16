import axios from "axios";
import React, {Component} from "react";
import Select from "../fields/Select";
import Button from "../fields/Button";
import stripHTML from "../../utils/formatters/stripHTML";
import "./SelectorUsage.css";

class SelectorUsage extends Component {

  constructor(props) {
    super(props);
    this.state = {
      minData: null,
      currentValues: {}
    };
  }

  componentDidMount() {
    this.setState({minData: this.props.minData});
  }

  componentDidUpdate(prevProps) {
    if (this.state.minData && prevProps.minData.id !== this.props.minData.id) {
      this.setState({minData: this.props.minData});
    }
  }

  removeItem(id) {
    const {minData} = this.state;
    const payload = {params: {section_id: minData.id, selector_id: id}};
    axios.delete("/api/cms/section_selector/delete", payload).then(resp => {
      if (resp.status === 200) {
        minData.selectors = resp.data;
        this.setState({minData});
      }
    });
  }

  addItem(id) {
    const {minData} = this.state;
    const {selectors} = minData;
    const allSelectors = this.props.selectors;
    const payload = {
      section_id: minData.id,
      selector_id: id,
      ordering: selectors.length
    };
    axios.post("/api/cms/section_selector/new", payload).then(resp => {
      const toMove = allSelectors.find(d => d.id === id);
      if (toMove) {
        toMove.section_selector = resp.data;
        minData.selectors.push(toMove);
        this.setState({minData});
      }
    });
  }

  onChange(name, e) {
    const {currentValues} = this.state;
    currentValues[name] = e.target.value;
    this.setState({currentValues});
    const selectionObj = {[name]: e.target.value};
    if (this.props.onSelect) this.props.onSelect(selectionObj);
  }

  render() {

    const {minData, currentValues} = this.state;
    const {variables} = this.props;
    const allSelectors = this.props.selectors;

    if (!minData) return null;

    const {selectors} = minData;

    const activeSelectors = [];
    const inactiveSelectors = [];

    allSelectors.forEach(selector => {
      if (selectors.map(s => s.id).includes(selector.id)) {
        activeSelectors.push(selector);
      }
      else {
        inactiveSelectors.push(selector);
      }
    });

    return (
      <div className="cms-selector-usage cms-card-container">

        <div className="cms-selector-usage-column">
          <h3 className="cms-selector-usage-heading u-font-sm">Inactive selectors</h3>
          {inactiveSelectors.length
            ? <ul className="cms-selector-usage-list">
              {inactiveSelectors.map(s =>
                <li className="cms-selector-usage-item" key={s.id}>
                  <label className="cms-selector-usage-item-label u-font-xs">
                    {s.name}
                    <Button
                      className="cms-selector-usage-item-button"
                      fontSize="xxxs"
                      context="cms"
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
                        context="cms"
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
                      context="cms"
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
                            : stripHTML(variables[option.option])}
                        </option>
                      )}
                    </Select>
                  }

                  {i !== activeSelectors.length - 1 &&
                    <div className="cms-reorder">
                      <Button
                        onClick={() => console.log("set me up jimmyyyy")}
                        className="cms-reorder-button"
                        context="cms"
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

export default SelectorUsage;
