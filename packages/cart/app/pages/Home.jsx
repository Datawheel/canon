import React, {Component} from "react";
import {Menu, MenuItem, Position, Popover, Button, Card, Elevation} from "@blueprintjs/core";

import {AddToCartControl, clearCartAction} from "../../src/";

import {setExample, setExampleVizBuilder} from "../actions/example";

import {connect} from "react-redux";

import "./Home.css";

class Home extends Component {

  constructor(props) {
    super(props);
    this.changeSource = this.changeSource.bind(this);
    this.changeExampleVisBuilder = this.changeExampleVisBuilder.bind(this);
  }

  changeSource = source => {
    const {dispatch, exampleList, activeSite} = this.props;
    if (activeSite !== source){
      dispatch(clearCartAction());
      dispatch(setExample(source));
      dispatch(setExampleVizBuilder(exampleList[source].list[0]));
    }
  }

  changeExampleVisBuilder = item => {
    const {dispatch} = this.props;
    dispatch(setExampleVizBuilder(item));
  }

  render() {
    const {activeSite, vizBuilderUrl, exampleList} = this.props;
    let queryList = [];

    if (exampleList[activeSite]) {
      queryList = exampleList[activeSite].list;
    }

    return (
      <div id="home">
        <div className="content">
          <div className="row">
            <div className="col-full">
              <h2>Select an example site:</h2>
            </div>
          </div>
          <div className="row">
            {Object.keys(exampleList).map((s, ix) =>
              <div className="col-third">
                <Card key={ix} interactive={true} elevation={s === activeSite ? Elevation.FOUR:Elevation.ZERO} onClick={() => this.changeSource(s)}>
                  <h2>{s}</h2>
                  <p>Engine: {exampleList[s].engine}</p>
                </Card>
              </div>
            )}
          </div>
          <hr/>
          {exampleList[activeSite] && <div className="row">
            <div className="col-full">
              <h1>{activeSite}</h1>
            </div>
          </div> }
          <div className="row">
            <div className="col-half">
              {exampleList[activeSite] && <div>
                <h2>Profile</h2>
                {queryList.map((q, ix) =>
                  <Card key={ix}>
                    <h3>{q.title}</h3>
                    <AddToCartControl query={q.query} tooltip={q.tooltip} />
                  </Card>
                )}
              </div>}
            </div>
            <div className="col-half">
              {exampleList[activeSite] && <div>
                <h2>VisBuilder</h2>
                <Card>
                  {queryList.map((q, ix) =>
                    <Button key={ix} text={q.title} active={vizBuilderUrl.query === q.query} onClick={() => this.changeExampleVisBuilder(q)} />
                  )}
                  <h3>{vizBuilderUrl.title}</h3>
                  <AddToCartControl query={vizBuilderUrl.query} tooltip={vizBuilderUrl.tooltip} />
                </Card>
              </div>}
            </div>
          </div>
        </div>
      </div>
    );
  }

}

export default
  connect(state => ({
    activeSite: state.example.site,
    vizBuilderUrl: state.example.vizBuilderUrl,
    exampleList: state.example.exampleList
  }))(Home);
