import axios from "axios";
import React, {Component} from "react";
import {Checkbox} from "@blueprintjs/core";
import Section from "../Section";
import Loading from "components/Loading";
import GeneratorCard from "../cards/GeneratorCard";
import Status from "../Status";
import "./toolbox.css";

const propMap = {
  generator: "generators",
  materializer: "materializers"
};

export default class Toolbox extends Component {

  constructor(props) {
    super(props);
    this.state = {
      minData: false,
      currentView: "generators",
      grouped: true,
      recompiling: true
    };
  }

  componentDidMount() {
    this.hitDB.bind(this)();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.id !== this.props.id) {
      this.hitDB.bind(this)();
    }
  }

  hitDB() {
    const {id} = this.props;
    if (id) {
      axios.get(`/api/cms/toolbox/${id}`).then(resp => {
        const minData = resp.data;
        this.setState({minData, recompiling: true}, this.fetchVariables.bind(this, true));
      });
    }
    else {
      this.setState({minData: false});
    }
  }

  fetchVariables(force) {
    if (this.props.fetchVariables) {
      this.props.fetchVariables(force, () => this.setState({recompiling: false}));
    }
  }

  addItem(type) {
    const {minData} = this.state;
    const payload = {};
    payload.profile_id = minData.id;
    // todo: move this ordering out to axios (let the server concat it to the end)
    payload.ordering = minData[propMap[type]].length;
    axios.post(`/api/cms/${type}/new`, payload).then(resp => {
      if (resp.status === 200) {
        if (type === "generator" || type === "materializer") {
          minData[propMap[type]].push({id: resp.data.id, name: resp.data.name, ordering: resp.data.ordering || null});
          this.setState({minData}, this.fetchVariables.bind(this, true));
        }
        else {
          minData[propMap[type]].push({id: resp.data.id, ordering: resp.data.ordering});
          this.setState({minData});
        }
      }
    });
  }

  onSave() {
    const forceGenID = null;
    const forceMatID = null;
    const forceKey = null;
    const recompiling = true;
    this.setState({forceGenID, forceMatID, forceKey, recompiling}, this.fetchVariables.bind(this, true));
  }

  onDelete(type, newArray) {
    const {minData} = this.state;
    minData[propMap[type]] = newArray;
    if (type === "generator" || type === "materializer") {
      this.setState({recompiling: true}, this.fetchVariables.bind(this, true));
    }
    else {
      this.setState({minData});
    }
  }

  onMove() {
    this.forceUpdate();
  }

  onClose() {
    const forceGenID = null;
    const forceMatID = null;
    const forceKey = null;
    this.setState({forceGenID, forceMatID, forceKey});
  }

  changeView(e) {
    this.setState({currentView: e.target.value});
  }

  openGenerator(key) {
    const {localeDefault, variables} = this.props;
    const vars = variables[localeDefault];

    const gens = Object.keys(vars._genStatus);
    gens.forEach(id => {
      if (vars._genStatus[id][key]) {
        this.setState({forceGenID: id, forceKey: key});
      }
    });

    const mats = Object.keys(vars._matStatus);
    mats.forEach(id => {
      if (vars._matStatus[id][key]) {
        this.setState({forceMatID: id, forceKey: key});
      }
    });
  }

  render() {

    const {currentView, grouped, minData, recompiling, forceGenID, forceMatID, forceKey} = this.state;
    const {variables, locale, localeDefault, previews} = this.props;

    if (!minData) {
      return <div className="cms-toolbox">
        Choose a Profile
      </div>;
    }

    const dataLoaded = minData;
    const varsLoaded = variables;
    const defLoaded = locale || variables && !locale && variables[localeDefault];
    const locLoaded = !locale || variables && locale && variables[localeDefault] && variables[locale];

    if (!dataLoaded || !varsLoaded || !defLoaded || !locLoaded) return <Loading />;

    return <div className="cms-toolbox">
      {/* loading status */}
      <Status recompiling={recompiling} />
      <h3>Toolbox</h3>
      <label className="cms-select-label">
        <strong>View:</strong>
        <select
          className="cms-select"
          value={currentView}
          onChange={this.changeView.bind(this)}
        >
          <option value="generators">Generators</option>
          <option value="formatters">Formatters</option>
        </select>
      </label>
      { currentView === "generators" && 
        <Checkbox checked={grouped} onChange={() => this.setState({grouped: !this.state.grouped})}>
          Group By Generator
        </Checkbox> 
      }
      { !grouped && <div className="cms-variables-list">
        <ul>
          {Object.keys(variables[localeDefault])
            .sort((a, b) => a.localeCompare(b))
            .filter(key => key !== "_genStatus" && key !== "_matStatus")
            .map(key => 
              <li key={key} className="cms-list-var" onClick={this.openGenerator.bind(this, key)}>
                <strong>{key}</strong>: {variables[localeDefault][key]}
              </li>
            )}
        </ul>
      </div> }
      {/* Hide the sections if not grouped - but SHOW them if forceKey is set, which means
        * that someone has clicked an individual variable and wants to view its editor
        */}
      <div style={grouped || forceKey ? {} : {display: "none"}}> 
        {/* generators */}
        <Section
          title="Generators"
          entity="generator"
          description="Variables constructed from JSON data calls."
          addItem={this.addItem.bind(this, "generator")}
          cards={minData.generators && minData.generators
            .sort((a, b) => a.name.localeCompare(b.name))
            .map(g => <GeneratorCard
              key={g.id}
              context="generator"
              hidden={!grouped}
              item={g}
              attr={minData.attr || {}}
              locale={localeDefault}
              secondaryLocale={locale}
              previews={previews}
              onSave={this.onSave.bind(this)}
              onDelete={this.onDelete.bind(this)}
              onClose={this.onClose.bind(this)}
              type="generator"
              variables={variables[localeDefault]}
              secondaryVariables={variables[locale]}
              forceKey={String(forceGenID) === String(g.id) ? forceKey : null}
            />)}
        />

        {/* materializers */}
        <Section
          title="Materializers"
          entity="materializer"
          description="Variables constructed from other variables. No API calls needed."
          addItem={this.addItem.bind(this, "materializer")}
          cards={minData.materializers && minData.materializers
            .map(m => <GeneratorCard
              key={m.id}
              context="materializer"
              hidden={!grouped}
              item={m}
              locale={localeDefault}
              secondaryLocale={locale}
              onSave={this.onSave.bind(this)}
              onDelete={this.onDelete.bind(this)}
              onClose={this.onClose.bind(this)}
              type="materializer"
              variables={variables[localeDefault]}
              secondaryVariables={variables[locale]}
              parentArray={minData.materializers}
              onMove={this.onMove.bind(this)}
              forceKey={String(forceMatID) === String(m.id) ? forceKey : null}
            />)}
        />
      </div>
      
    </div>;

  }

}
