import React from "react";
import PropTypes from "prop-types";
import {Intent} from "@blueprintjs/core";
import classnames from "classnames";

import {loadControl, setStatePromise} from "./actions/loadstate";
import AreaChart from "./components/AreaChart";
import AreaLoading from "./components/AreaLoading";
import AreaSidebar from "./components/AreaSidebar";
import {ErrorToaster} from "./components/ErrorToaster";
import {resetClient} from "./helpers/api";
import initialState from "./state";

import "@blueprintjs/labs/dist/blueprint-labs.css";
import "./index.css";

class Vizbuilder extends React.PureComponent {
  constructor(props) {
    super(props);

    resetClient(props.src);
    this.state = initialState();

    this.loadControl = loadControl.bind(this);
    this.stateUpdate = this.stateUpdate.bind(this);
  }

  getChildContext() {
    return {
      loadControl: this.loadControl,
      stateUpdate: this.stateUpdate
    };
  }

  componentDidUpdate(prevProps, prevState) {
    const {src, datasetDidChange} = this.props;
    const {dataset, load} = this.state;
    const {error} = load;

    if (src && prevProps.src !== src) {
      resetClient(src);
      this.setState(initialState());
    }

    if (datasetDidChange && dataset !== prevState.dataset) {
      datasetDidChange(dataset);
    }

    if (error && prevState.load.error !== error) {
      console.error(error.stack);
      ErrorToaster.show({intent: Intent.WARNING, message: error.message});
    }
  }

  render() {
    const {dataset, load, members, options, query} = this.state;
    return (
      <div className={classnames("vizbuilder", {loading: load.inProgress})}>
        <AreaLoading {...load} />
        <AreaSidebar options={options} query={query} />
        <AreaChart dataset={dataset} members={members} query={query} />
      </div>
    );
  }

  stateUpdate(newState) {
    return setStatePromise.call(this, state => {
      const finalState = {};
      const keys = Object.keys(newState);

      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        finalState[key] = {
          ...state[key],
          ...newState[key]
        };
      }

      return finalState;
    });
  }
}

Vizbuilder.childContextTypes = {
  loadControl: PropTypes.func,
  stateUpdate: PropTypes.func
};

Vizbuilder.propTypes = {
  src: PropTypes.string,
  datasetWillChange: PropTypes.func,
  datasetDidChange: PropTypes.func
};

export default Vizbuilder;
