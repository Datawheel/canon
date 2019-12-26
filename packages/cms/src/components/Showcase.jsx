import React, {Component, Fragment} from "react";
import {hot} from "react-hot-loader/root";

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

const baseDir = "https://github.com/Datawheel/canon/blob/master/packages/cms/src/components";

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
      currentView: "components"
    };
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

  /** filter down list of components */
  setFilter(e) {
    this.setState({filter: e.target.value});
  }

  /** injects a message into Status, then removes it */
  updateStatus(message) {
    this.setState({toastAlert: message});
    setTimeout(() => this.setState({toastAlert: false}), 2000);
  }

  render() {
    const {namespace, currentView, filter, toastAlert, alertIsOpen, dialogIsOpen, statusIsOpen} = this.state;

    const components = [
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

    let filteredComponents = components; // eslint-disable-line prefer-const
    if (filter) {
      filteredComponents.map(g =>
        g.components = g.components.filter(c => c.name.toLowerCase().indexOf(filter.toLowerCase()) !== -1)
      );
    }

    return (
      <div className={`showcase ${namespace}`}>

        {/* header */}
        <header className="showcase-header">
          <h1 className="showcase-header-heading u-margin-top-off u-font-md">
            All the <Select
              className="showcase-header-heading-select"
              options={["components", "design tokens"]}
              onChange={e => this.setState({currentView: e.target.value})}
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
            onReset={() => this.setState({filter: ""})}
          />

          {/* list of links */}
          <nav className="showcase-nav">
            {filteredComponents && filteredComponents.map(group => group.components.length
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
          </nav>
        </header>

        {/* list of components */}
        <ul className="showcase-list">
          {filteredComponents && filteredComponents.map(group => group.components.length
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
        </ul>

        {/* nicer than a standard browser alert() */}
        <Status recompiling={toastAlert} busy={toastAlert} done="okay thx bye" />
      </div>
    );
  }
}

export default hot(Showcase);
