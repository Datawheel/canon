import React, {Component, Fragment} from "react";
import {hot} from "react-hot-loader/root";
import Clipboard from "react-clipboard.js";

import {AnchorLink} from "@datawheel/canon-core";

import toKebabCase from "../utils/formatters/toKebabCase";
import lowerCaseFirst from "../utils/formatters/lowerCaseFirst";
import styles from "style.yml";

import Button from "./fields/Button";
import ButtonGroup from "./fields/ButtonGroup";
import Select from "./fields/Select";
import TextInput from "./fields/TextInput";
import Textarea from "./fields/Textarea";
import TextButtonGroup from "./fields/TextButtonGroup";
import FilterSearch from "./fields/FilterSearch";

import Alert from "./interface/Alert";
import Dialog from "./interface/Dialog";
import Dropdown from "./interface/Dropdown";
import Status from "./interface/Status";

import ConsoleVariable from "./variables/ConsoleVariable";
import DefinitionList from "./variables/DefinitionList";
import VarList from "./variables/VarList";
import VarTable from "./variables/VarTable";

import Parse from "./sections/components/Parse";
import Stat from "./sections/components/Stat";

import "./Showcase.css";

// convert styles object to array of key-value pairs
const tokens = Object.entries(styles);

// split tokens out into groups
const groupedTokens = [
  {name: "colors", tokens: []},
  {name: "typography", tokens: []},
  {name: "spacing", tokens: []},
  {name: "miscellaneous", tokens: []}
];
tokens.map((t, i) => {
  // add the value of any aliased tokens as a third item in the array
  let aliasedVar = null;
  if (t[1].indexOf("var(--") !== -1) {
    aliasedVar = t[1].replace("var(--", "").replace(")", "")
  };
  tokens[i][2] = styles[[aliasedVar]];

  // group into colors
  if (t[0].indexOf("color") !== -1 || t[1].indexOf("#") === 0 || (t[2] && t[2].indexOf("#") === 0)) {
    groupedTokens[0].tokens.push(t);
  }
  // group into typography
  else if (t[0].match(/(font|letter|text|weight|heading-size|paragraph-size|subhead-size)/)) {
    groupedTokens[1].tokens.push(t);
  }
  // group into spacing
  else if (t[0].indexOf("gutter") !== -1) {
    groupedTokens[2].tokens.push(t);
  }
  // group into measurements
  else (groupedTokens[3].tokens.push(t));
});

// base directory to use for component links
const baseDir = "https://github.com/Datawheel/canon/blob/master/packages/cms/src/components";

/** a showcase for the design system */
class Showcase extends Component {
  constructor(props) {
    super(props);
    this.state = {
      namespace: "cms",
      toastAlert: false,
      alertIsOpen: false,
      dialogIsOpen: false,
      statusIsOpen: false,
      filter: "",
      filteredTokens: groupedTokens
    };
  }

  /** check the route and determine which view to render */
  componentDidMount() {
    const {slug} = this.props.params;

    if (slug && slug === "tokens") this.setState({currentView: "design tokens"});
    else this.setState({currentView: "components"});
  }

  /** udpate route and content on select menu change */
  changeView(e) {
    const newView = e.target.value;
    this.setState({currentView: newView});

    const {router} = this.props;
    const path = this.props.location.pathname.split('/')[0];
    router.push(`/${path}/${newView === "design tokens" ? "tokens" : newView}`);
  }

  /** logs the current props in the console, including the currently selected namespace */
  logProps(c) {
    if (c.Component && c.props) {
      this.updateStatus("current props logged in console");
      const namespacedProps = {...c.props, ...{namespace: this.state.namespace}};
      console.log({props: namespacedProps});
    }
    return null;
  }

  /** checks whether the token is a color or not, and returns the color */
  getTokenColor(token) {
    if (token[1].indexOf("#") === 0) return token[1];
    else if (token[2] && token[2].indexOf("#") === 0) return token[2];
    return null;
  }

  /** filter down list of components */
  setFilter(e) {
    const filter = typeof e === "string" ? e : e.target.value;

    let filteredTokens = [];

    groupedTokens.forEach((g, i) => {
      filteredTokens[i] = Object.assign({}, g);
      filteredTokens[i].tokens = g.tokens.filter(t => t.join().indexOf(filter.toLowerCase()) !== -1);
    });

    this.setState({filter, filteredTokens});
  }

  /** injects a message into Status, then removes it */
  updateStatus(message) {
    this.setState({toastAlert: message});
    setTimeout(() => this.setState({toastAlert: false}), 2000);
  }

  render() {
    const {namespace, currentView, filter, filteredTokens, toastAlert, alertIsOpen, dialogIsOpen, statusIsOpen} = this.state;

    // define the list of components
    let components, filteredComponents = [];
    if (currentView === "components") {
      components = [
        {
          name: "Fields",
          components: [
            {
              name: "Button",
              Component: Button,
              link: `${baseDir}/fields/Button.jsx`,
              props: {
                children: "children as button text",
                icon: "tick",
                iconPosition: "left",
                onClick: () => this.updateStatus("`onClick` triggered")
              }
            },
            {
              name: "ButtonGroup",
              Component: ButtonGroup,
              link: `${baseDir}/fields/ButtonGroup.jsx`,
              props: {
                buttons: [
                  {
                    namespace,
                    active: namespace === "cms",
                    onClick: () => this.setState({namespace: "cms"}),
                    children: "cms"
                  },
                  {
                    namespace,
                    active: namespace === "cp",
                    onClick: () => this.setState({namespace: "cp"}),
                    children: "cp"
                  }
                ]
              }
            },
            {
              name: "TextInput",
              Component: TextInput,
              link: `${baseDir}/fields/TextInput.jsx`,
              props: {
                label: "What's ur password?",
                inline: true,
                type: "password",
                onChange: () => this.updateStatus("`onChange` triggered")
              }
            },
            {
              name: "Textarea",
              Component: Textarea,
              link: `${baseDir}/fields/Textarea.jsx`,
              props: {
                label: "It’s like a TextInput, but for multiple lines",
                inline: false,
                type: "password",
                onChange: () => this.updateStatus("`onChange` triggered")
              }
            },
            {
              name: "TextButtonGroup",
              Component: TextButtonGroup,
              link: `${baseDir}/fields/TextButtonGroup.jsx`,
              props: {
                inputProps: {
                  label: "TextInput + Button in a form",
                  placeholder: "focus me & hit enter",
                  inline: true,
                  namespace
                },
                buttonProps: {
                  children: "I don't really do anything",
                  icon: "star",
                  iconOnly: true,
                  onClick: () => this.updateStatus("`buttonProps.onClick` triggered"),
                  namespace
                }
              }
            },
            {
              name: "Select",
              Component: Select,
              link: `${baseDir}/fields/Select.jsx`,
              props: {
                label: "label",
                inline: true,
                onChange: () => this.updateStatus("`onChange` triggered"),
                options: [
                  "options generated from array passed to `options` prop",
                  "or pass options as children",
                  "or both if you want"
                ]
              }
            },
            {
              name: "FilterSearch",
              Component: FilterSearch,
              link: `${baseDir}/fields/FilterSearch.jsx`,
              props: {
                label: "Label is also placeholder text",
                onChange: () => this.updateStatus("`onChange` triggered"),
                onReset: e => e.target.value = ""
              }
            }
          ]
        },
        {
          name: "Interface",
          components: [
            {
              name: "Alert",
              Component: Alert,
              link: `${baseDir}/interface/Alert.jsx`,
              props: {
                title: "You've opened the alert",
                description: "Nicely done 👏",
                onCancel: () => this.setState({alertIsOpen: false}),
                onConfirm: () => this.setState({alertIsOpen: false}),
                cancelButtonText: "custom cancel text",
                confirmButtonText: "custom confirm text",
                theme: "caution",
                isOpen: alertIsOpen
              }
            },
            {
              name: "Dialog",
              Component: Dialog,
              link: `${baseDir}/interface/Dialog.jsx`,
              props: {
                title: "Dialog title",
                description: "Nicely done 👏",
                onClose: () => this.setState({dialogIsOpen: false}),
                onSave: () => {
                  this.updateStatus("`onSave` triggered");
                  this.setState({dialogIsOpen: false});
                },
                onDelete: () => this.updateStatus("`onDelete` triggered"),
                theme: "caution",
                isOpen: dialogIsOpen,
                fullWidth: false,
                children: <Fragment>
                  <h2>Render whatever you want here in the body with <code>children</code></h2>
                  <p>You can also add elements to the dialog header and footer with the <code>headerControls</code> & <code>footerControls</code> props</p>
                </Fragment>
              }
            },
            {
              name: "Status",
              Component: Status,
              link: `${baseDir}/interface/Status.jsx`,
              props: {
                recompiling: statusIsOpen,
                busy: "Doing some stuff…",
                done: "We're finished"
              }
            }
          ]
        },
        {
          name: "Miscellaneous",
          components: [
            {
              name: "Parse",
              Component: Parse,
              link: `${baseDir}/sections/components/Parse.jsx`,
              props: {
                El: "h2",
                id: "more-like-dangerously-set-inner-shut-up-react-amirite",
                className: "custom-class",
                children: "The rich text editor wants me to be a <em>p</em> tag, but I’m a <strong>heading</strong><p><br></p>…or I can be whatever <code>El</code> you want"
              }
            },
            {
              name: "Stat",
              Component: Stat,
              link: `${baseDir}/sections/components/Stat.jsx`,
              props: {
                El: "p",
                label: "Stat `label`",
                value: "100% real",
                subtitle: "More context via the `subtitle` prop"
              }
            },
            {
              name: "DefinitionList",
              Component: DefinitionList,
              link: `${baseDir}/variables/DefinitionList.jsx`,
              props: {
                definitions: [
                  {label: "label", text: "text"},
                  {label: "butts", text: "farts"}
                ]
              }
            },
            {
              name: "ConsoleVariable",
              Component: ConsoleVariable,
              link: `${baseDir}/variables/ConsoleVariable.jsx`,
              props: {
                value: function butts() {
                  return "farts";
                }
              }
            },
            {
              name: "VarTable",
              Component: VarTable,
              link: `${baseDir}/variables/VarTable.jsx`,
              props: {
                dataset: {
                  buttsFunc: function butts() {
                    return "farts";
                  },
                  booleanVar: true,
                  stringVar: "hello",
                  numeralVar: 5318008,
                  anArray: ["one", 2]
                }
              }
            },
            {
              name: "VarList",
              Component: VarList,
              link: `${baseDir}/variables/VarList.jsx`,
              props: {
                vars: [
                  function butts() {
                    return "farts";
                  },
                  true,
                  "hello"
                ]
              }
            }
          ]
        }
      ];

      filteredComponents = components;
      if (filter) {
        filteredComponents.map(g =>
          g.components = g.components.filter(c => c.name.toLowerCase().indexOf(filter.toLowerCase()) !== -1)
        );
      }
    }

    return (
      <div className={`showcase ${namespace}`}>

        {/* header */}
        <header className="showcase-header">
          <h1 className="showcase-header-heading u-margin-top-off u-font-md">
            All the <Select
              className="showcase-header-heading-select"
              options={["components", "design tokens"]}
              onChange={e => this.changeView(e)}
              value={currentView}
              namespace={namespace}
              fontSize="md"
              label="select view"
              labelHidden
            />
          </h1>
          
          <FilterSearch
            label={`filter ${currentView}`}
            fontSize="sm"
            namespace={namespace}
            value={filter}
            onChange={e => this.setFilter(e)}
            onReset={() => this.setFilter("")}
          />

          {/* list of links */}
          <nav className="showcase-nav">
            {/* list of components */}
            {currentView === "components" && filteredComponents.map(group => group.components.length
              ? <Fragment key={`${group.name}-nav-group`}>
                {/* group title */}
                <h2 className="showcase-nav-heading u-font-xs display" key={`${group.name}-nav-title`}>
                  {group.name}
                </h2>
                {/* group components */}
                <ul className="showcase-nav-list">
                  {group.components.map(c =>
                    <li className="showcase-nav-item" key={`${c.name}-nav-nav`}>
                      <AnchorLink className="showcase-nav-link u-font-xs" to={toKebabCase(c.name)}>
                        {c.name}
                      </AnchorLink>
                    </li>
                  )}
                </ul>
              </Fragment> : ""
            )}
            {/* list of tokens */}
            {currentView === "design tokens" && 
              <ul className="showcase-nav-list u-margin-top-md">
                {filteredTokens.map(group => group.tokens && group.tokens.length
                  ? <li className="showcase-nav-item" key={`${group.name}-nav-nav`}>
                    <AnchorLink className="showcase-nav-link display u-font-xs u-margin-top-xs" to={toKebabCase(group.name)}>
                      {group.name}
                    </AnchorLink>
                  </li> : ""
                )}
              </ul>
            }
          </nav>
        </header>

        <ul className={`showcase-list showcase-${currentView === "components" ? "component" : "token"}-list`}>
          {/* list of components */}
          {currentView === "components" && filteredComponents.map(group => group.components.length
            ? <li className="showcase-list-group" key={`${group.name}-group`}>
              {/* group title */}
              <h2 className="showcase-list-heading display u-font-md" key={`${group.name}-title`}>
                {group.name}
              </h2>
              {/* group components */}
              <ul className="showcase-nested-list" key={`${group.name}-list`}>
                {group.components.map(c =>
                  <li className="showcase-item" id={toKebabCase(c.name)} key={`${c.name}-item`}>
                    {/* heading + github link */}
                    <h3 className="showcase-item-heading u-font-xxs u-margin-top-off u-margin-bottom-md" key={`${c.name}h`}>
                      <a className="showcase-item-heading-link" href={c.link}>
                        {c.name}
                      </a>
                    </h3>

                    {/* log current props */}
                    <Button
                      className="showcase-item-props-button"
                      onClick={() => this.logProps(c)}
                      icon="console"
                      fontSize="xxs"
                      namespace={namespace}
                      iconOnly
                      key={`${c.name}pb`}
                    >
                      Copy props
                    </Button>

                    {/* for components that need to be triggered */}
                    {c.name === "Alert" || c.name === "Dialog" || c.name === "Status"
                      ? <Button
                        className="showcase-trigger-button"
                        namespace={namespace}
                        fill
                        onClick={() => this.setState({
                          [lowerCaseFirst(`${c.name}IsOpen`)]: !this.state[lowerCaseFirst(`${c.name}IsOpen`)]
                        })}
                        key={`${c.name}tb`}
                      >
                        {this.state[lowerCaseFirst(`${c.name}IsOpen`)] ? "Close" : "Open"} {lowerCaseFirst(c.name)}
                      </Button> : ""
                    }

                    {/* the component */}
                    <c.Component namespace={namespace} {...c.props} key={`${c}c`} />
                  </li>
                )}
              </ul>
            </li> : ""
          )}
          {/* list of design tokens */}
          {currentView === "design tokens" && filteredTokens.map(group => group.tokens && group.tokens.length
            ? <li className="showcase-list-group showcase-item" key={`${group.name}-token-group`}>
              {/* group title */}
                <h2 id={toKebabCase(group.name)} className="showcase-list-heading display u-font-md" key={`${group.name}-token-title`}>
                  {group.name}
                </h2>
                {/* group components */}
                <ul className="showcase-nested-list" key={`${group.name}-token-list`}>
                  {group.tokens.map(token => 
                    <Clipboard
                      className="showcase-token u-font-xxs"
                      data-clipboard-text={`var(--${token[0]})`}
                      component="li"
                      onSuccess={() => this.updateStatus("variable copied!")}
                    >
                      {this.getTokenColor(token) &&
                        <span className="showcase-token-swatch" style={{backgroundColor: this.getTokenColor(token)}} />
                      }
                      <span className="showcase-token-label">{token[0]}</span> 
                      <span className="showcase-token-value">
                        {token[1]}
                        {token[2] &&
                          <span className="showcase-token-alias u-font-xxs"> ({token[2]})</span> 
                        }
                      </span>
                    </Clipboard>
                  )}
                </ul>
            </li> : ""
          )}
        </ul>

        {/* nicer than a standard browser alert() */}
        <Status recompiling={toastAlert} busy={toastAlert} done="okay thx bye" />
      </div>
    );
  }
}

export default hot(Showcase);
