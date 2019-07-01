import React, {Component} from "react";
import PropTypes from "prop-types";
import {connect} from "react-redux";
import Card from "./Card";
import TextViz from "./TextViz";
import Column from "./Column";
import Tabs from "./Tabs";
const sectionTypes = {Card, Column, Tabs, TextViz};

class Section extends Component {

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
    const Comp = sectionTypes[contents.type] || TextViz;

    return <Comp contents={contents} loading={loading} sources={sources} />;

  }

}

Section.contextTypes = {
  formatters: PropTypes.object,
  router: PropTypes.object,
  variables: PropTypes.object
};

Section.childContextTypes = {
  formatters: PropTypes.object,
  variables: PropTypes.object
};

export default connect(state => ({
  locale: state.i18n.locale
}))(Section);
