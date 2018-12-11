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
        hierarchies: [],
        levels: []
      },
      selectedDimension: {}
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
    const selectedDimension = cubeData.find(d => d.name === e.target.value);
    profileData.cubeName = selectedDimension.cubeName;
    profileData.dimension = e.target.value;
    profileData.dimName = selectedDimension.dimName;
    profileData.hierarchies = selectedDimension.hierarchies;
    profileData.levels = selectedDimension.hierarchies.map(h => h.level);
    this.setState({profileData, selectedDimension});

  }

  addLevel(level) {
    const {profileData, selectedDimension} = this.state;
    profileData.levels.push(level);
    profileData.hierarchies = [];
    profileData.levels.forEach(level => {
      profileData.hierarchies.push(selectedDimension.hierarchies.find(h => h.level === level));
    });
    this.setState({profileData});
  }

  removeLevel(level) {
    const {profileData, selectedDimension} = this.state;
    profileData.levels = profileData.levels.filter(l => l !== level);
    profileData.hierarchies = [];
    profileData.levels.forEach(level => {
      profileData.hierarchies.push(selectedDimension.hierarchies.find(h => h.level === level));
    });
    this.setState({profileData});
  }

  createProfile() {
    const {profileData} = this.state;
    if (this.props.onCreateProfile) this.props.onCreateProfile(profileData);
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
      <div className="pt-dialog-body">
        <div className="cms-field-container cms-field-container-inline">
          <label htmlFor="slug">Slug: </label>
          <input id="slug" className="pt-input" type="text" value={profileData.slug} onChange={this.changeField.bind(this, "slug")}/>
        </div>
        <div className="cms-field-container">
          Dimension:
          <div className="pt-select">
            <select className="field-input" value={profileData.dimension} onChange={this.chooseDimension.bind(this)}>
              <option value="default">Choose One</option>
              {dimOptions}
            </select>
          </div>
        </div>
        { profileData.dimension &&
          <div className="cms-field-container">
            Levels:
            <MultiSelect
              items={levelList}
              itemPredicate={(q, o) => `${o.toLowerCase()}`.indexOf(q.toLowerCase()) >= 0}
              itemRenderer={i =>
                <MenuItem
                  key={i.item}
                  onClick={i.handleClick}
                  text={i.item}
                  shouldDismissPopover={false}
                />
              }
              noResults={<MenuItem disabled={true} text="No results." />}
              onItemSelect={o => profileData.levels.includes(o) ? this.removeLevel.bind(this)(o) : this.addLevel.bind(this)(o)}
              tagRenderer={o => o}
              tagInputProps={{onRemove: o => this.removeLevel.bind(this)(o)}}
              selectedItems={profileData.levels}
              popoverProps={{
                popoverClassName: "pt-minimal",
                useSmartArrowPositioning: false
              }}
            />
          </div>
        }
        { profileData.dimension && profileData.levels.length > 0 &&
          <div className="cms-field-container">
            Measure:
            <div className="pt-select">
              <select className="field-input" value={profileData.measure} onChange={this.changeField.bind(this, "measure")}>
                <option value="default">Choose One</option>
                {measureOptions}
              </select>
            </div>
          </div>
        }
        <div className="cms-field-container">
          { profileData.dimension && profileData.levels.length > 0 && profileData.measure
            ? <button className="cms-button" onClick={this.createProfile.bind(this)}>Create profile</button>
            : <div className="cms-button is-disabled" disabled>Create profile</div>
          }
        </div>

      </div>

    );
  }
}

export default NewProfile;
