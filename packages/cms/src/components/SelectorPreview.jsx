import axios from "axios";
import React, {Component} from "react";

class SelectorPreview extends Component {

  constructor(props) {
    super(props);
    this.state = {
      minData: null
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
        console.log(minData.selectors);
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

  render() {

    const {minData} = this.state;

    if (!minData) return null;

    const {selectors, allSelectors} = minData;

    const remainingSelectors = allSelectors
      .filter(d => !selectors.map(s => s.topic_selector.selector_id).includes(d.id));

    return (
      <div>
        <h3>Active Selectors</h3>
        <ul>
          {selectors.map(s => 
            <li key={s.id}>
              <label>{s.name}</label>
              {s.options.length > 0 &&
              <select className="cms-select">
                {s.options && s.options.map(o =>
                  <option key={o.option}>{`${o.option} ${o.isDefault ? "(default)" : ""}`}</option>
                )}
              </select>
              }
              <button onClick={this.removeItem.bind(this, s.topic_selector.id)}>Remove</button>
            </li>
          )}
        </ul>
        <h3>Inactive Selectors</h3>
        <ul>
          {remainingSelectors.map(s => 
            <li key={s.id}>
              <label>{s.name}</label>
              <button onClick={this.addItem.bind(this, s.id)}>Add</button>
            </li>
          )}
        </ul>
        
      </div>
    );
  }
}

export default SelectorPreview;
