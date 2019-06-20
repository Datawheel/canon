import axios from "axios";
import React, {Component} from "react";
import {Checkbox} from "@blueprintjs/core";
import Section from "../Section";
import Button from "../Button";
import GeneratorCard from "../cards/GeneratorCard";
import Status from "../Status";
import "./toolbox.css";

const propMap = {
  generator: "generators",
  materializer: "materializers",
  formatter: "formatters"
};

export default class Toolbox extends Component {

  constructor(props) {
    super(props);
    this.state = {
      minData: false,
      currentView: "generators",
      detailView: true,
      recompiling: true,
      query: ""
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
        const maybeFetch = type === "formatter" ? null : this.fetchVariables.bind(this, true);
        minData[propMap[type]].push({
          id: resp.data.id, 
          name: resp.data.name, 
          description: resp.data.description,
          ordering: resp.data.ordering || null});
        this.setState({minData}, maybeFetch);
      }
    });
  }

  /**
   * When a user saves a generator or materializer, we need to clear out the "force" vars. "Force" vars
   * are what force a gen/mat to open when the user clicks a variable directly - aka "I want to edit the
   * gen/mat this variable came from." However, something else need be done here. If the user has changed
   * the name (title) of the gen/mat, then that change is only reflected inside the state of the card -
   * not out here, where it need be searchable. Though it's slightly overkill, the easiest thing to do
   * is just hit the DB again on save to reload everything.
   */
  onSave() {
    const forceGenID = null;
    const forceMatID = null;
    const forceKey = null;
    const recompiling = true;
    this.setState({forceGenID, forceMatID, forceKey, recompiling}, this.hitDB.bind(this));
  }

  onDelete(type, newArray) {
    const {minData} = this.state;
    minData[propMap[type]] = newArray;
    const recompiling = type === "formatter" ? false : true;
    const maybeFetch = type === "formatter" ? null : this.fetchVariables.bind(this, true);
    this.setState({minData, recompiling}, maybeFetch);
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

  filter(e) {
    this.setState({query: e.target.value});
  }

  filterFunc(d) {
    const {query} = this.state;
    const fields = ["name", "description"];
    return fields.map(f => d[f] ? d[f].toLowerCase().includes(query) : false).some(d => d);
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

    const {currentView, detailView, minData, recompiling, query, forceGenID, forceMatID, forceKey} = this.state;
    const {variables, locale, localeDefault, previews} = this.props;

    if (!minData) {
      return null;
    }

    const dataLoaded = minData;
    const varsLoaded = variables;
    const defLoaded = locale || variables && !locale && variables[localeDefault];
    const locLoaded = !locale || variables && locale && variables[localeDefault] && variables[locale];

    if (!dataLoaded || !varsLoaded || !defLoaded || !locLoaded) return <div className="cms-toolbox"><h3>Loading...</h3></div>;

    const generators = minData.generators
      .sort((a, b) => a.name.localeCompare(b.name))
      .filter(this.filterFunc.bind(this));

    const materializers = minData.materializers
      .sort((a, b) => a.name.localeCompare(b.name))
      .filter(this.filterFunc.bind(this));

    const formatters = minData.formatters
      .sort((a, b) => a.name.localeCompare(b.name))
      .filter(this.filterFunc.bind(this));

    // If a search filter causes no results, hide the entire section. However, if
    // the ORIGINAL data has length 0, always show it, so the user can add the first one.
    const showGenerators = minData.generators.length === 0 || generators.length > 0;
    const showMaterializers = minData.materializers.length === 0 || materializers.length > 0;
    const showFormatters = minData.formatters.length === 0 || formatters.length > 0;

    return <div className="cms-toolbox">
      <label className="cms-field-container">
        <span className="u-visually-hidden">filter by name, output, description...</span>
        <input
          type="search"
          placeholder="filter by name, output, description..."
          value={query}
          onChange={this.filter.bind(this)}
        />
      </label>

      <div className="button-group">
        <Button
          onClick={() => this.setState({detailView: true})}
          icon="th-list"
          iconPosition="left"
        >
          detail view
        </Button>
        <Button
          onClick={() => this.setState({detailView: false})}
          icon="list"
          iconPosition="left"
        >
          output view
        </Button>
      </div>

      {!detailView &&
        <div className="cms-variables-list">
          <ul>
            {Object.keys(variables[localeDefault])
              .sort((a, b) => a.localeCompare(b))
              .filter(key => key !== "_genStatus" && key !== "_matStatus")
              .filter(key => key.toLowerCase().includes(query.toLowerCase()) || typeof variables[localeDefault][key] === "string" && variables[localeDefault][key].toLowerCase().includes(query.toLowerCase()))
              .map(key =>
                <li key={key} className="cms-list-var" onClick={this.openGenerator.bind(this, key)}>
                  <strong>{key}</strong>: {variables[localeDefault][key]}
                </li>
              )}
          </ul>
        </div>
      }
      {/* Hide the sections if not detailView - but SHOW them if forceKey is set, which means
        * that someone has clicked an individual variable and wants to view its editor
        */}
      <div style={detailView || forceKey ? {} : {display: "none"}}>
        {/* generators */}
        {showGenerators && <Section
          title="Generators"
          entity="generator"
          description="Variables constructed from JSON data calls."
          addItem={this.addItem.bind(this, "generator")}
          cards={generators.map(g => 
            <GeneratorCard
              key={g.id}
              context="generator"
              hidden={!detailView}
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
        />}

        {/* materializers */}
        {showMaterializers && <Section
          title="Materializers"
          entity="materializer"
          description="Variables constructed from other variables. No API calls needed."
          addItem={this.addItem.bind(this, "materializer")}
          cards={materializers.map(m => 
            <GeneratorCard
              key={m.id}
              context="materializer"
              hidden={!detailView}
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
        />}
      </div>
      { detailView && <div>
        {/* formatters */}
        {showFormatters && <Section
          title="Formatters"
          entity="formatter"
          addItem={this.addItem.bind(this, "formatter")}
          description="Javascript Formatters for Canon text components"
          cards={formatters.map(g => 
            <GeneratorCard
              context="formatter"
              key={g.id}
              item={g}
              onSave={this.onSave.bind(this)}
              onDelete={this.onDelete.bind(this)}
              type="formatter"
              variables={{}}
            />)
          }
        />}
      </div>}

      {/* loading status */}
      <Status recompiling={recompiling} />
    </div>;

  }

}
