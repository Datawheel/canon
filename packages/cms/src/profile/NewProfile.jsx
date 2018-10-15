import React, {Component} from "react";
// import {Menu, MenuItem, MenuDivider, Popover, Position} from "@blueprintjs/core";
import {MultiSelect} from "@blueprintjs/labs";

class NewProfile extends Component {

  constructor(props) {
    super(props);
    this.state = {
      profileData: {
        slug: "",
        dimension: "",
        level: ""
      }
    };
  }

  changeField(field, e) {
    const {profileData} = this.state;
    profileData[field] = e.target.value;
    this.setState({profileData});
  } 

  render() {

    const {profileData} = this.state;
    const {cubeData} = this.props;

    const dimOptions = cubeData.map(d => <option key={d.name} value={d.name}>{d.name}</option>);
    const levOptions = profileData.dimension ? cubeData
      .find(c => c.name === profileData.dimension).hierarchies
      .map(h => <option key={h.level} value={h.level}>{h.level}</option>) : [];
    const measureOptions = profileData.dimension && profileData.level ? cubeData
      .find(c => c.name === profileData.dimension).measures
      .map(m => <option key={m} value={m}>{m}</option>) : [];

    return (
      <div style={{margin: "15px"}}>
        <div style={{margin: "10px"}}>
          Slug: 
          <input className="pt-input" style={{marginLeft: "10px", width: "180px"}} type="text" dir="auto" value={profileData.slug} onChange={this.changeField.bind(this, "slug")}/>
        </div>
        <div style={{margin: "10px"}}>
          Dimension:
          <div className="pt-select">
            <select style={{marginLeft: "10px"}} className="field-input" value={profileData.dimension} onChange={this.changeField.bind(this, "dimension")}>
              <option value="default">Choose One</option>
              {dimOptions}
            </select>
          </div>
        </div>
        { profileData.dimension && <div style={{margin: "10px"}}>
          Levels:
          <div className="pt-select">
            <select style={{marginLeft: "10px"}} className="field-input" value={profileData.level} onChange={this.changeField.bind(this, "level")}>
              <option value="default">Choose One</option>
              {levOptions}
            </select>
          </div>
        </div>
        }
        { profileData.dimension && profileData.level && <div style={{margin: "10px"}}>
          Measure:
          <div className="pt-select">
            <select style={{marginLeft: "10px"}} className="field-input" value={profileData.measure} onChange={this.changeField.bind(this, "measure")}>
              <option value="default">Choose One</option>
              {measureOptions}
            </select>
          </div>
        </div>
        }

      </div>

    );
  }
}

export default NewProfile;
