import axios from "axios";
import React, {Component} from "react";
import Select from "./Select";
import Button from "./Button";
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

  removeItem(id) {
    const {minData} = this.state;
    axios.delete("/api/cms/topic_selector/delete", {params: {id}}).then(resp => {
      if (resp.status === 200) {
        minData.selectors = resp.data;
        this.setState({minData});
      }
    });
  }

  addItem(id) {
    const {minData} = this.state;
    const {selectors} = minData;
    const payload = {
      topic_id: minData.id,
      selector_id: id,
      ordering: selectors.length
    };
    axios.post("/api/cms/topic_selector/new", payload).then(resp => {
      const toMove = minData.allSelectors.find(d => d.id === id);
      if (toMove) {
        toMove.topic_selector = resp.data;
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

    if (!minData) return null;

    const {selectors, allSelectors} = minData;

    const remainingSelectors = allSelectors
      .filter(d => !selectors.map(s => s.topic_selector.selector_id).includes(d.id));

    return (
      <div className="cms-selector-usage cms-card-container">

        <div className="cms-selector-usage-column">
          <h3 className="cms-selector-usage-heading font-sm">Inactive selectors</h3>
          <ul className="cms-selector-usage-list">
            {remainingSelectors.map(s =>
              <li className="cms-selector-usage-item" key={s.id}>
                <label className="cms-selector-usage-item-label font-xs">
                  {s.name}
                  <Button
                    className="cms-selector-usage-item-button font-xxxs"
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
        </div>

        <div className="cms-selector-usage-column">
          <h3 className="cms-selector-usage-heading font-sm">Active selectors</h3>
          <ol className="cms-selector-usage-list">

            {selectors.map((s, i) =>
              <li className="cms-card cms-selector-card" key={`${s.id}-usage-card`}>

                {/* header */}
                <div className="cms-card-heading">
                  <h3 className="cms-card-heading-text font-sm">{s.name}</h3>
                  <div className="cms-button-group">
                    <Button
                      className="cms-card-heading-button font-xxs"
                      onClick={this.removeItem.bind(this, s.topic_selector.id)}
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
                    value={currentValues[s.name]}
                    onChange={this.onChange.bind(this, s.name)}
                  >
                    {s.options.map(option =>
                      <option
                        key={`select-option-${option.option}`}
                        value={option.option}
                      >
                        {typeof variables[option.option] === "object"
                          ? JSON.stringify(variables[option.option])
                          : variables[option.option]}
                      </option>
                    )}
                  </Select>
                }

                {i !== selectors.length - 1 &&
                  <div className="cms-reorder">
                    <Button
                      onClick={() => console.log("set me up jimmyyyy")}
                      className="cms-reorder-button"
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
        </div>
      </div>
    );
  }
}

export default SelectorUsage;
