import React, {Component} from "react";
import {connect} from "react-redux";
import TopNav from "components/TopNav";
import {Button, Card, Elevation} from "@blueprintjs/core";
import {clearCartAction, AddToCartControl} from "@datawheel/canon-cart";
import {setExampleCart, clearCustomList} from "../../actions/cartExample";
import CustomAddUrls from "./CustomAddUrls";

import "./CartDemo.css";

class CartPage extends Component {

  constructor(props) {
    super(props);
    this.navigateExample = this.navigateExample.bind(this);
    this.state = {
      selectedDynamic: false
    }
  }

  navigateExample(newId) {
    const {selectedExample, dispatch} = this.props;
    if (newId !== selectedExample.id) {
      dispatch(clearCartAction());
      dispatch(clearCustomList());
      dispatch(setExampleCart(newId));
    }
  }

  changeSelectedDynamic(item) {
    this.setState({selectedDynamic: item});
  }

  render() {
    const {exampleList, selectedExample} = this.props;
    const {selectedDynamic} = this.state;

    return (
      <div id="cart-demo">
        <TopNav />
        <div className="content">
          <div className="row">
            <div className="col-full">
              <h2>Select an example site:</h2>
            </div>
          </div>
          <div className="row">
            {Object.keys(exampleList).map((s, ix) =>
              <div className="col-third">
                <Card key={ix} interactive={true} elevation={s === selectedExample.id ? Elevation.FOUR : Elevation.ZERO} onClick={() => this.navigateExample(s)}>
                  <h2>{exampleList[s].name}</h2>
                  <p>Engine: {exampleList[s].engine}</p>
                </Card>
              </div>
            )}
          </div>
          <hr />
          {selectedExample && <div id="cart-test-container">
            <div className="row">
              <div className="col-full">
                <h1>{selectedExample.name}</h1>
              </div>
            </div>
            <div className="row">
              <div className="col-half">
                <div>
                  <h2>Static</h2>
                  {selectedExample.list.map((q, ix) =>
                    <Card key={ix}>
                      <h3>{q.title}</h3>
                      <AddToCartControl query={q.query} tooltip={q.tooltip} />
                    </Card>
                  )}
                </div>
              </div>
              <div className="col-half">
                <div>
                  <h2>Dynamic</h2>
                  <Card>
                    <p>Click an option to generate an Add To Cart button dynamically.</p>
                    {selectedExample.list.map((q, ix) =>
                      <Button key={ix} text={q.title} active={selectedDynamic.query === q.query} onClick={() => this.changeSelectedDynamic(q)} />
                    )}
                    {selectedDynamic && <>
                      <h3>{selectedDynamic.title}</h3>
                      <AddToCartControl query={selectedDynamic.query} tooltip={selectedDynamic.tooltip} />
                    </>}
                  </Card>
                  <h2>Add custom urls</h2>
                  <Card>
                    <CustomAddUrls />
                  </Card>
                </div>
              </div>
            </div>
          </div>}
        </div>
      </div>
    );
  }

}

export default
  connect(state => {
    return {
      selectedExample: state.cartExample.selectedExampleCart,
      exampleList: state.cartExample.exampleList
    }
  })(CartPage);
