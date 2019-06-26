import React, {Component} from "react";
import PropTypes from "prop-types";
import axios from "axios";
import {connect} from "react-redux";
import Card from "./topics/Card";
import TextViz from "./topics/TextViz";
import Column from "./topics/Column";
import Tabs from "./topics/Tabs";
const topicTypes = {Card, Column, Tabs, TextViz};

class Topic extends Component {

  constructor(props) {
    super(props);
    this.state = {
      contents: props.contents,
      loading: false,
      selectors: {},
      sources: []
    };
  }

  onSelector(name, value) {

    const {id} = this.state.contents;
    const {selectors} = this.state;
    const {locale} = this.props;
    const {variables} = this.context;

    if (value instanceof Array && !value.length) delete selectors[name];
    else selectors[name] = value;

    this.setState({loading: true, selectors});
    this.updateSource.bind(this)(false);
    const url = `/api/profile?topic=${id}&locale=${locale}&${Object.entries(selectors).map(([key, val]) => `${key}=${val}`).join("&")}`;
    const payload = {variables};
    axios.post(url, payload)
      .then(resp => {
        this.setState({contents: resp.data, loading: false});
      });

  }

  updateSource(newSources) {
    if (!newSources) this.setState({sources: []});
    else {
      const {sources} = this.state;
      newSources
        .map(s => s.annotations)
        .forEach(source => {
          if (source.source_name && !sources.find(s => s.source_name === source.source_name)) sources.push(source);
        });
      this.setState({sources});
    }
  }

  getChildContext() {
    const {formatters, variables} = this.context;
    return {
      formatters,
      onSelector: this.onSelector.bind(this),
      variables: this.props.variables || variables
    };
  }

  render() {

    const {contents, loading, sources} = this.state;
    const Comp = topicTypes[contents.type] || TextViz;

    return <Comp contents={contents} loading={loading} sources={sources} />;

  }

}

Topic.contextTypes = {
  formatters: PropTypes.object,
  router: PropTypes.object,
  variables: PropTypes.object
};

Topic.childContextTypes = {
  formatters: PropTypes.object,
  onSelector: PropTypes.func,
  variables: PropTypes.object
};

export default connect(state => ({
  locale: state.i18n.locale
}))(Topic);
