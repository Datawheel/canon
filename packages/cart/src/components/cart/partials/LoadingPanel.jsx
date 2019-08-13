import React from "react";
import {connect} from "react-redux";

import {NonIdealState, Spinner, Icon} from "@blueprintjs/core";

import "./LoadingPanel.css";

class LoadingPanel extends React.Component {
  constructor(props, ctx) {
    super(props);
    this.state = {};
    this.generateLoadingList = this.generateLoadingList.bind(this);
    this.generateLoadingItem = this.generateLoadingItem.bind(this);
  }

  componentDidMount() {

  }

  componentDidUpdate(prevProps) {
  }

  componentWillUnmount() {

  }

  generateLoadingItem(title, loading) {
    const isLoaded = loading ? <Spinner size={16} /> : <Icon icon="endorsed" />;
    return <div className="canon-cart-loading-item">{title}<span className="canon-cart-loading-item-icon">{isLoaded}</span></div>;
  }

  generateLoadingList() {
    const {datasets, loadingList, cartProcessing} = this.props;
    return <div className="canon-cart-loading-list">
      {Object.keys(datasets).map(ix =>
        this.generateLoadingItem(datasets[`${ix}`].name, loadingList.indexOf(`${ix}`) > -1)
      )}
      <hr/>
      {
        cartProcessing &&
        <div className="canon-cart-loading-item">
          Processing datasets<span className="canon-cart-loading-item-icon"><Spinner size={Spinner.SIZE_SMALL} /></span>
        </div>
      }
      {
        !cartProcessing &&
        <div className="canon-cart-loading-item"></div>
      }
    </div>;
  }

  render() {
    const {cartProcessing} = this.props;
    const LoadingElements = this.generateLoadingList();
    return (
      <NonIdealState className={"canon-cart-loading-panel"} icon="shopping-cart" title={<span>{cartProcessing ? "Processing..." : "Loading..."}</span>} description={LoadingElements} action={<p></p>} />
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
    loadingList: ct.loadingList,
    cartProcessing: ct.internal.processing
  };
})(LoadingPanel);

