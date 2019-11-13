import React, {Children, Component} from "react";
import "../styles/json.css";

/**
 * @typedef JsonRendererExpandableProps
 * @property {boolean} [defaultExpanded]
 * @property {boolean} isArray
 * @property {string} name
 */

/** @type {React.Component<JsonRendererExpandableProps, {isOpen: boolean}>} */
class JsonRendererExpandable extends Component {
  constructor(props) {
    super(props);
    this.state = {isOpen: Boolean(props.defaultExpanded)};
    this.toggleOpenState = () => this.setState(state => ({isOpen: !state.isOpen}));
  }

  render() {
    const {children, name, isArray} = this.props;
    const {isOpen} = this.state;

    const type = isArray ? "Array" : "Object";
    const count = Children.count(children);

    return (
      <div className={`json-parent ${isOpen ? "open" : ""}`}>
        <div
          className={`json-property ${type.toLowerCase()}`}
          onClick={this.toggleOpenState}
        >
          <span className="json-name">{name}</span>
          <span className="json-value">{`${type}(${count}) ${isOpen ? "-" : "+"}`}</span>
        </div>
        {isOpen ? children : null}
      </div>
    );
  }
}

/**
 * @typedef JsonRendererProps
 * @property {boolean} [defaultExpanded]
 * @property {string} name
 * @property {any} value
 */

/** @type {React.FC<JsonRendererProps>} */
const JsonRenderer = function(props) {
  const {name, value} = props;
  if (/number|string|boolean/.test(typeof value) || !value) {
    const type = value == null ? `${value}` : typeof value;
    return (
      <div className={`json-property ${type}`}>
        <span className="json-name">{name}</span>
        <span className="json-value">{"" + value}</span>
      </div>
    );
  }
  else {
    return (
      <JsonRendererExpandable
        defaultExpanded={props.defaultExpanded}
        isArray={Array.isArray(value)}
        name={name}
      >
        {Object.keys(value).map(key => (
          <JsonRenderer key={key} name={key} value={value[key]} />
        ))}
      </JsonRendererExpandable>
    );
  }
};

export default JsonRenderer;
