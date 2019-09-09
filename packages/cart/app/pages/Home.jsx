import React, {Component} from "react";
import {Menu, MenuItem, Position, Popover, Button, Card} from "@blueprintjs/core";

import {AddToCartControl, clearCartAction} from "../../src/";

import {connect} from "react-redux";

import "./Home.css";

class Home extends Component {

  constructor(props) {
    super(props);
    this.state = {
      source: null,
      selectedQuery: false
    };

    this.changeSource = this.changeSource.bind(this);
    this.changeExampleVisBuilder = this.changeExampleVisBuilder.bind(this);
  }

  exampleList = {
    "DataChile": {
      engine: "mondrian",
      list: [
        {title: "Crimes by Crime Group in Region Metropolitana", query: "https://chilecube.datachile.io/cubes/crimes/aggregate.json?drilldown%5B%5D=%5BGeography%5D.%5BRegion%5D&drilldown%5B%5D=%5BCrime%5D.%5BCrime+Group%5D&cut%5B%5D=%5BGeography%5D.%5BGeography%5D.%5BRegion%5D.%26%5B13%5D&measures%5B%5D=Cases&nonempty=true&distinct=false&parents=false&debug=true&sparse=true", tooltip: true},
        {title: "Number of Visas in Region Valparaiso", query: "https://chilecube.datachile.io/cubes/immigration/aggregate.jsonrecords?drilldown%5B%5D=%5BGeography%5D.%5BRegion%5D&cut%5B%5D=%5BGeography%5D.%5BGeography%5D.%5BRegion%5D.%26%5B5%5D&measures%5B%5D=Number+of+visas&nonempty=true&distinct=false&parents=false&debug=true&sparse=true", tooltip: false},
        {title: "Income by Region", query: "https://chilecube.datachile.io/cubes/nesi_income/aggregate.json?drilldown%5B%5D=%5BGeography%5D.%5BRegion%5D&measures%5B%5D=Income&measures%5B%5D=Median+Income&nonempty=true&distinct=false&parents=false&debug=true&sparse=true", tooltip: true}
      ]
    },
    "DataUSA": {
      engine: "logiclayer",
      list: [
        {title: "Median Household Income", query: "https://datausa.io/api/data?measure=Household%20Income%20by%20Race,Household%20Income%20by%20Race%20Moe&Geography=16000US3651000:parents,16000US3651000,16000US3651000:similar", tooltip: false},
        {title: "Poverty by Age and Gender", query: "https://datausa.io/api/data?Geography=16000US3651000&drilldowns=Age,Gender&measure=Poverty%20Population,Poverty%20Population%20Moe&Poverty%20Status=0", tooltip: true},
        {title: "Employment by Occupations", query: "https://datausa.io/api/data?Geography=04000US06&measure=Total%20Population,Total%20Population%20MOE%20Appx,Average%20Wage,Average%20Wage%20Appx%20MOE,Record%20Count&Workforce%20Status=true&Record%20Count>=5&drilldowns=Detailed%20Occupation&parents=true", tooltip: true},
        {title: "Domestic Trade Growth", query: "https://datausa.io/api/data?Origin State=04000US06,04000US06:neighbors&measure=Millions%20Of%20Dollars,Thousands%20Of%20Tons", tooltip: true},
        {title: "Patient to Clinician Ratios", query: "https://datausa.io/api/data?measure=Patient%20to%20Primary%20Care%20Physician%20Ratio,Patient%20to%20Primary%20Care%20Physician%20Ratio%20Data%20Source%20Years&Geography=04000US36:neighbors,04000US36", tooltip: true},
        {title: "Health Care Spending", query: "https://datausa.io/api/data?Geography=16000US3651000&measures=Per%20Enrollee%20Private%20Health%20Insurance%20Spending%20on%20Personal%20Health%20Care,Per%20Enrollee%20Medicaid%20Spending%20on%20Personal%20Health%20Care,Per%20Enrollee%20Medicare%20Spending%20on%20Personal%20Health%20Care,Total%20Per%20Capita%20Spending%20on%20Personal%20Health%20Care", tooltip: true}
      ]
    },
    "DataMexico": {
      engine: "tesseract",
      list: [
        {title: "Households by Home Type and State", query: "https://api.datamexico.org/tesseract/cubes/inegi_housing/aggregate.jsonrecords?drilldowns%5B%5D=Geography.State&drilldowns%5B%5D=Home+Type.Home+Type&measures%5B%5D=Households&parents=false&sparse=false", tooltip: true},
        {title: "Population by Job Situation and State", query: "https://api.datamexico.org/tesseract/cubes/inegi_population/aggregate.jsonrecords?drilldowns%5B%5D=Geography.State&drilldowns%5B%5D=JobSituation.JobSituation&measures%5B%5D=Population&parents=false&sparse=false", tooltip: false}
      ]
    },
    "OEC World": {
      engine: "tesseract",
      list: [
        {title: "Trade value by continent", query: "https://api.oec.world/tesseract/cubes/oec_trade_i_comtrade_m_hs/aggregate.jsonrecords?drilldowns%5B%5D=Reporter.Geography.Continent&measures%5B%5D=Trade+Value&parents=false&sparse=false", tooltip: true},
        {title: "Qty trade by continent", query: "https://api.oec.world/tesseract/cubes/oec_trade_i_baci_a_92/aggregate.jsonrecords?drilldowns%5B%5D=Exporter.Geography.Continent&measures%5B%5D=Quantity&parents=false&sparse=false", tooltip: false}
      ]
    }
  };

  changeSource = source => {
    this.props.dispatch(clearCartAction());
    this.setState({source, selectedQuery: this.exampleList[source].list[0]});
  }

  changeExampleVisBuilder = item => {
    this.setState({selectedQuery: item});
  }

  render() {
    const {source, selectedQuery} = this.state;
    let queryList = [];
    if (this.exampleList[source]) {
      queryList = this.exampleList[source].list;
    }
    const sources = Object.keys(this.exampleList);

    const exampleMenu = <Menu>
      {sources.map((s, ix) =>
        <MenuItem key={ix} text={`${s} [${this.exampleList[s].engine}]`} active={source === s} onClick={() => this.changeSource(s)} />
      )}
    </Menu>;

    return (
      <div id="home">
        <div className="content">
          <div className="row">
            <div className="col-full">
              <Popover content={exampleMenu} position={Position.RIGHT_TOP}>
                <Button icon="multi-select" text={`${source ? `${source} examples [${this.exampleList[source].engine}]` : "Choose a real world example site"}`} />
              </Popover>
            </div>
          </div>
          <div className="row">
            <div className="col-half">
              {this.exampleList[source] && <div>
                <h2>Multiple instances of AddToCartControl like a profile has embeded in charts</h2>
                {queryList.map((q, ix) =>
                  <Card key={ix}>
                    <h3>{q.title}</h3>
                    <p><small>(tooltip: {q.tooltip ? "true" : "false"})</small></p>
                    <AddToCartControl query={q.query} tooltip={q.tooltip} />
                  </Card>
                )}
              </div>}
            </div>
            <div className="col-half">
              {this.exampleList[source] && <div>
                <h2>Single instance of AddToCartControl and change the query prop like VisBuilder do</h2>
                <Card>
                  {queryList.map((q, ix) =>
                    <Button key={ix} text={q.title} active={selectedQuery.query === q.query} onClick={() => this.changeExampleVisBuilder(q)} />
                  )}
                  <h3>{selectedQuery.title}</h3>
                  <p><small>(tooltip: {selectedQuery.tooltip ? "true" : "false"})</small></p>
                  <AddToCartControl query={selectedQuery.query} tooltip={selectedQuery.tooltip} />
                </Card>
              </div>}
            </div>
          </div>
        </div>
      </div>
    );
  }

}

export default connect()(Home);
