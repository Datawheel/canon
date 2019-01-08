import React, {Component} from "react";
import PropTypes from "prop-types";

class Tabs extends Component {

  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {

    const {onSelector, variables} = this.context;
    const {default: defaultValue, id, loading, options, name, title} = this.props;
    const slug = `${name}-${id}`;

    return <div className="selector">
      { title && <label htmlFor={slug}>{title}</label> }
      <div className="pt-select pt-fill">
        <select id={slug} name={name} onChange={d => onSelector(name, d.target.value)} disabled={loading} defaultValue={defaultValue}>
          { options.map(({option}) => <option value={option} key={option}>{variables[option]}</option>) }
        </select>
      </div>
    </div>;
  }

}

Tabs.contextTypes = {
  onSelector: PropTypes.func,
  variables: PropTypes.object
};

export default Tabs;
