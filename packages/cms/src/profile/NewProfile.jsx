import React, {Component} from "react";
import {MenuItem} from "@blueprintjs/core";
import {MultiSelect} from "@blueprintjs/labs";

class NewProfile extends Component {

  constructor(props) {
    super(props);
    this.state = {
      profileData: {
        slug: "",
        cubeName: "", 
        dimName: "",
        dimension: "",
        levels: []
      }
    };
  }

  changeField(field, e) {
    const {profileData} = this.state;
    profileData[field] = e.target.value;
    this.setState({profileData});
  } 

  chooseDimension(e) {
    const {cubeData} = this.props;
    const {profileData} = this.state;
    const dim = cubeData.find(d => d.name === e.target.value);
    profileData.cubeName = dim.cubeName;
    profileData.dimension = e.target.value;
    profileData.dimName = dim.dimName;
    this.setState({profileData});

  }

  addLevel(level) {
    const {profileData} = this.state;
    profileData.levels.push(level);
    this.setState({profileData});
  }

  removeLevel(level) {
    const {profileData} = this.state;
    profileData.levels = profileData.levels.filter(l => l !== level);
    this.setState({profileData});
  }

  createProfile() {
    const {profileData} = this.state;
    console.log("would ship", profileData);
  }

  render() {

    const {profileData} = this.state;
    const {cubeData} = this.props;

    const dimOptions = cubeData.map(d => <option key={d.name} value={d.name}>{d.name}</option>);
    const levelList = profileData.dimension ? cubeData
      .find(c => c.name === profileData.dimension).hierarchies
      .map(h => h.level) : [];
    const measureOptions = profileData.dimension ? cubeData
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
            <select style={{marginLeft: "10px"}} className="field-input" value={profileData.dimension} onChange={this.chooseDimension.bind(this)}>
              <option value="default">Choose One</option>
              {dimOptions}
            </select>
          </div>
        </div>
        { profileData.dimension && <div style={{margin: "10px"}}>
          Levels:
          <MultiSelect
            // initialContent={}
            items={levelList}
            itemPredicate={(q, o) => `${o.toLowerCase()}`.indexOf(q.toLowerCase()) >= 0}
            itemRenderer={i => <MenuItem
              // iconName={this.isFilmSelected(film) ? "tick" : "blank"}
              key={i.item}
              // label={i.item}
              onClick={i.handleClick}
              text={i.item}
              shouldDismissPopover={false}
            />}
            noResults={<MenuItem disabled={true} text="No results." />}
            onItemSelect={o => profileData.levels.includes(o) ? this.removeLevel.bind(this)(o) : this.addLevel.bind(this)(o)}
            tagRenderer={o => o}
            tagInputProps={{onRemove: o => this.removeLevel.bind(this)(o)}}
            selectedItems={profileData.levels}
          />
        </div>
        }
        { profileData.dimension && profileData.levels.length > 0 && <div style={{margin: "10px"}}>
          Measure:
          <div className="pt-select">
            <select style={{marginLeft: "10px"}} className="field-input" value={profileData.measure} onChange={this.changeField.bind(this, "measure")}>
              <option value="default">Choose One</option>
              {measureOptions}
            </select>
          </div>
        </div>
        }
        { profileData.dimension && profileData.levels.length > 0 && profileData.measure && <div style={{margin: "10px"}}>
          <button onClick={this.createProfile.bind(this)}>Create Profile</button>
        </div>
        }

      </div>

    );
  }
}

export default NewProfile;
