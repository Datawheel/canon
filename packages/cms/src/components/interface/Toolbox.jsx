import axios from "axios";
import React, {Component} from "react";
import Accardion from "./Accardion";
import ButtonGroup from "../fields/ButtonGroup";
import FilterSearch from "../fields/FilterSearch";
import GeneratorCard from "../cards/GeneratorCard";
import SelectorCard from "../cards/SelectorCard";
import Status from "./Status";
import ConsoleVariable from "../variables/ConsoleVariable";
import "./Toolbox.css";

const propMap = {
  generator: "generators",
  materializer: "materializers",
  formatter: "formatters",
  selector: "selectors"
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

  hitDB(query) {
    const {id} = this.props;
    if (id) {
      axios.get(`/api/cms/toolbox/${id}`).then(resp => {
        const minData = resp.data;
        const callback = () => {
          this.updateSelectors.bind(this)();
          this.fetchVariables.bind(this)(true, query);
        };
        this.setState({minData, recompiling: true}, callback);
      });
    }
    else {
      this.setState({minData: false});
    }
  }

  fetchVariables(force, query) {
    if (this.props.fetchVariables) {
      const callback = () => this.setState({recompiling: false});
      this.props.fetchVariables(force, callback, query);
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
        // Selectors, unlike the rest of the elements, actually do pass down their entire
        // content to the Card (the others are simply given an id and load the data themselves)
        if (type === "selector") {
          minData[propMap[type]].push(resp.data);
          // updateselector?
        }
        else {
          minData[propMap[type]].push({
            id: resp.data.id,
            name: resp.data.name,
            description: resp.data.description,
            ordering: resp.data.ordering || null
          });
        }
        let forceID, forceOpen, forceType = null;
        if (type === "generator" || type === "materializer") {
          forceID = resp.data.id;
          forceType = type;
          forceOpen = true;
        }
        this.setState({minData, forceID, forceType, forceOpen}, maybeFetch);
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
  onSave(query) {
    const forceID = null, forceOpen = null, forceType = null, recompiling = true;
    this.setState({forceID, forceType, forceOpen, recompiling}, this.hitDB.bind(this, query));
  }

  updateSelectors() {
    const {minData} = this.state;
    if (minData) {
      const {selectors} = minData;
      if (this.props.updateSelectors) this.props.updateSelectors(selectors);
    }
  }

  onDelete(type, newArray) {
    const {minData} = this.state;
    minData[propMap[type]] = newArray;
    const recompiling = type === "formatter" ? false : true;
    const maybeFetch = type === "formatter" ? null : this.fetchVariables.bind(this, true);
    this.setState({minData, recompiling}, maybeFetch);
    if (type === "selector") {
      const {selectors} = minData;
      if (this.props.updateSelectors) this.props.updateSelectors(selectors);
    }
  }

  onMove() {
    this.forceUpdate();
  }

  onClose() {
    const forceID = null, forceOpen = null, forceType = null;
    this.setState({forceID, forceType, forceOpen});
  }

  filter(e) {
    this.setState({query: e.target.value});
  }

  onReset() {
    this.setState({query: ""});
    setTimeout(
      document.querySelector(".cms-filter-search-input").focus()
    ), 0;
  }

  filterFunc(d) {
    const {query, forceOpen, forceID, forceType} = this.state;
    const fields = ["name", "description", "title"];
    const matched = fields.map(f => d[f] ? d[f].toLowerCase().includes(query) : false).some(d => d);
    const opened = d.type === forceType && d.id === forceID && forceOpen;
    return matched || opened;
  }

  openGenerator(key) {
    const {localeDefault, variables} = this.props;
    const vars = variables[localeDefault];

    const gens = Object.keys(vars._genStatus);
    gens.forEach(id => {
      if (vars._genStatus[id][key]) {
        this.setState({forceID: Number(id), forceType: "generator", forceOpen: true});
      }
    });

    const mats = Object.keys(vars._matStatus);
    mats.forEach(id => {
      if (vars._matStatus[id][key]) {
        this.setState({forceID: Number(id), forceType: "materializer", forceOpen: true});
      }
    });
  }

  render() {

    const {detailView, minData, recompiling, query, forceID, forceType, forceOpen} = this.state;
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
      .map(d => Object.assign({}, {type: "generator"}, d))
      .filter(this.filterFunc.bind(this));

    const materializers = minData.materializers
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(d => Object.assign({}, {type: "materializer"}, d))
      .filter(this.filterFunc.bind(this));

    const formatters = minData.formatters
      .sort((a, b) => a.name.localeCompare(b.name))
      .filter(this.filterFunc.bind(this));

    const selectors = minData.selectors
      .sort((a, b) => a.title.localeCompare(b.title))
      .filter(this.filterFunc.bind(this));

    // If a search filter causes no results, hide the entire grouping. However, if
    // the ORIGINAL data has length 0, always show it, so the user can add the first one.
    const showGenerators = minData.generators.length === 0 || generators.length > 0;
    const showMaterializers = minData.materializers.length === 0 || materializers.length > 0;
    const showFormatters = minData.formatters.length === 0 || formatters.length > 0;
    const showSelectors = minData.selectors.length === 0 || selectors.length > 0;

    return <div className="cms-toolbox">
      <FilterSearch
        label="filter by name, output, description..."
        value={query}
        onChange={this.filter.bind(this)}
        onReset={this.onReset.bind(this)}
      />

      <ButtonGroup context="cms" buttons={[
        {
          onClick: () => this.setState({detailView: true}),
          active: detailView,
          context: "cms",
          icon: "th-list",
          iconPosition: "left",
          children: "detail view"
        },
        {
          onClick: () => this.setState({detailView: false}),
          active: !detailView,
          context: "cms",
          icon: "list",
          iconPosition: "left",
          children: "output view"
        }
      ]} />

      {!detailView &&
        <ul className="cms-definition-list">
          {Object.keys(variables[localeDefault])
            .sort((a, b) => a.localeCompare(b))
            .filter(key => key !== "_genStatus" && key !== "_matStatus")
            .filter(key => key.toLowerCase().includes(query.toLowerCase()) || typeof variables[localeDefault][key] === "string" && variables[localeDefault][key].toLowerCase().includes(query.toLowerCase()))
            .map(key =>
              <li key={key} className="cms-definition-item" onClick={this.openGenerator.bind(this, key)}>
                <span className="cms-definition-label font-xxs">{key}: </span>
                <span className="cms-definition-text font-xxs">
                  <ConsoleVariable value={variables[localeDefault][key]} />
                </span>
              </li>
            )}
        </ul>
      }

      {/* Hide the panels if not detailView - but SHOW them if forceOpen is set, which means
        * that someone has clicked an individual variable and wants to view its editor
        */}
      <div className={`cms-toolbox-accardion-wrapper${detailView || forceOpen ? "" : " is-hidden"}`}>

        {(showGenerators || forceOpen) &&
          <Accardion
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
                forceOpen={forceType === "generator" && forceID === g.id ? forceOpen : null}
              />
            )}
          />
        }

        {(showMaterializers  || forceOpen) &&
          <Accardion
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
                forceOpen={forceType === "materializer" && forceID === m.id ? forceOpen : null}
              />
            )}
          />
        }

        { detailView && showSelectors &&
          <Accardion
            title="Selectors"
            entity="selector"
            description="Profile-wide Selectors."
            addItem={this.addItem.bind(this, "selector")}
            cards={selectors.map(s =>
              <SelectorCard
                key={s.id}
                minData={s}
                type="selector"
                locale={localeDefault}
                onSave={this.updateSelectors.bind(this)}
                onDelete={this.onDelete.bind(this)}
                variables={variables[localeDefault]}
              />
            )}
          />
        }

        { detailView && showFormatters &&
          <Accardion
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
              />
            )}
          />
        }
      </div>

      {/* loading status */}
      <Status recompiling={recompiling} />
    </div>;
  }
}
