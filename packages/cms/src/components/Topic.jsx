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

  componentDidUpdate(prevProps) {
    if (JSON.stringify(prevProps.contents) !== JSON.stringify(this.props.contents)) {
      this.setState({contents: this.props.contents});
      this.updateSource.bind(this)(false);
    }
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
      variables: this.props.variables || variables
    };
  }

  render() {

    const {contents, sources} = this.state;
    const {loading} = this.props;
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
  variables: PropTypes.object
};

export default connect(state => ({
  locale: state.i18n.locale
}))(Topic);
