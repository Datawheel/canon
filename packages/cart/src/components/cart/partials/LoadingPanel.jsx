import React from "react";
import {connect} from "react-redux";

import {NonIdealState, Spinner, Icon} from "@blueprintjs/core";

import "./LoadingPanel.css";

class LoadingPanel extends React.Component {
  constructor(props, ctx) {
    super(props);
    this.state = {
      datasets: props.datasets
    };
  }

  componentDidMount() {

  }

  componentDidUpdate(prevProps) {
    const changedDatasets = prevProps.loadingList.length !== this.props.loadingList.length;
    if (changedDatasets) {
      this.setState({datasets: this.props.datasets});
    }
  }

  componentWillUnmount() {

  }

  generateLoadingItem(title, loaded) {
    const isLoaded = !loaded ? <Icon icon="endorsed" /> : <Spinner size={Spinner.SIZE_SMALL} />;
    return <div className="canon-cart-loading-item">{title}<span className="canon-cart-loading-item-icon">{isLoaded}</span></div>;
  }

  render() {
    const {datasets} = this.state;
    const {loadingList} = this.props;

    const LoadingElements = <div className="canon-cart-loading-list">
      {Object.keys(datasets).reverse().map(ix =>
        this.generateLoadingItem(datasets[ix].name, loadingList.indexOf(`${ix}`) > -1)
      )}
    </div>;
    return (
      <NonIdealState className={"canon-cart-loading-panel"} icon="shopping-cart" title={<span>Loading...</span>} description={LoadingElements} action={<p></p>} />
    );
  }
}

LoadingPanel.contextTypes = {
};

LoadingPanel.propTypes = {
};

LoadingPanel.defaultProps = {
};

export const defaultProps = LoadingPanel.defaultProps;
export default connect(state => {
  const ct = state.cart;
  return {
    datasets: ct.list,
    loadingList: ct.loadingList
  };
})(LoadingPanel);

