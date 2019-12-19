import React, {Component} from "react";
import {Button, Card, Elevation} from "@blueprintjs/core";

import {AddToCartControl, clearCartAction} from "../../src/";

import {setExampleVizBuilder, clearCustomList} from "../actions/example";

import {connect} from "react-redux";

import CustomAddUrls from "../components/CustomAddUrls";

import "./Home.css";
import {DISABLED} from "@blueprintjs/core/lib/esm/common/classes";

class Home extends Component {

  constructor(props) {
    super(props);
    this.navigateExample = this.navigateExample.bind(this);
    this.changeExampleVisBuilder = this.changeExampleVisBuilder.bind(this);
  }

  componentDidMount(){
    const {dispatch, data} = this.props;
    if(data){
      dispatch(setExampleVizBuilder(data.list[0]));
    }
  }

  navigateExample(newId){
    const {data, dispatch, router} = this.props;
    if(newId !== data.id){
      dispatch(clearCartAction());
      dispatch(clearCustomList());
      router.push('/home/' + newId);
    }
  }

  changeExampleVisBuilder = item => {
    const {dispatch} = this.props;
    dispatch(setExampleVizBuilder(item));
  }

  render() {
    const {vizBuilderUrl, exampleList, data} = this.props;

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
                <Card key={ix} interactive={true} elevation={s === data.id ? Elevation.FOUR : Elevation.ZERO} onClick={()=>this.navigateExample(s)}>
                  <h2>{exampleList[s].name}</h2>
                  <p>Engine: {exampleList[s].engine}</p>
                </Card>
              </div>
            )}
          </div>
          <hr/>
          {data && <div id="cart-test-container">
            <div className="row">
              <div className="col-full">
                <h1>{data.name}</h1>
              </div>
            </div>
            <div className="row">
              <div className="col-half">
                <div>
                  <h2>Profile</h2>
                  {data.list.map((q, ix) =>
                    <Card key={ix}>
                      <h3>{q.title}</h3>
                      <AddToCartControl query={q.query} tooltip={q.tooltip} />
                    </Card>
                  )}
                </div>
              </div>
              <div className="col-half">
                {vizBuilderUrl && <div>
                  <h2>VisBuilder</h2>
                  <Card>
                    {data.list.map((q, ix) =>
                      <Button key={ix} text={q.title} active={vizBuilderUrl.query === q.query} onClick={() => this.changeExampleVisBuilder(q)} />
                    )}
                    <h3>{vizBuilderUrl.title}</h3>
                    <AddToCartControl query={vizBuilderUrl.query} tooltip={vizBuilderUrl.tooltip} />
                  </Card>
                  <h2>Add custom urls</h2>
                  <Card>
                    <CustomAddUrls/>
                  </Card>
                </div>}
              </div>
            </div>
          </div>}
        </div>
      </div>
    );
  }

}

Home.need = [function (params, store) {
  const promise = new Promise((resolve, reject) => {
    resolve({
      key: "home_data",
      data: params.id ? {...store.example.exampleList[params.id],id:params.id}:false
    });
  });

  return {
    type: "GET_DATA",
    promise: promise
  };
}];

export default
  connect(state => {
    return {
      data: state.data.home_data ? state.data.home_data:false,
      vizBuilderUrl: state.example.vizBuilderUrl,
      exampleList: state.example.exampleList
    }
  })(Home);
