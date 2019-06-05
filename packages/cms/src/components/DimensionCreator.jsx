import React, {Component} from "react";
import {MenuItem} from "@blueprintjs/core";
import {MultiSelect} from "@blueprintjs/select";

class DimensionCreator extends Component {

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
    this.setState({
      profileData,
      selectedDimension
    });

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

  toggleLevel(level, e) {
    const {checked} = e.target;
    checked ? this.addLevel.bind(this)(level) : this.removeLevel.bind(this)(level);
  }

  createProfile() {
    const {profileData} = this.state;
    if (this.props.onAddDimension) this.props.onAddDimension(profileData);
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
      <div className="bp3-dialog-body">
        <div className="cms-field-container cms-field-container-inline">
          <label htmlFor="slug">Slug: </label>
          <input id="slug" className="bp3-input" type="text" value={profileData.slug} onChange={this.changeField.bind(this, "slug")}/>
        </div>
        <div className="cms-field-container">
          Dimension:
          <div className="bp3-select">
            <select className="field-input" value={profileData.dimension} onChange={this.chooseDimension.bind(this)}>
              <option value="default">Choose One</option>
              {dimOptions}
            </select>
          </div>
        </div>
        { profileData.dimension &&
          <div className="cms-field-container">
            Levels:

            {/* new hotness */}
            <fieldset className="cms-fieldset">
              { levelList.map(level =>
                <label className="cms-checkbox-label" key={level}>
                  <input
                    className="cms-checkbox"
                    type="checkbox"
                    checked={ profileData.levels.includes(level) }
                    onChange={ this.toggleLevel.bind(this, level) }
                  /> {level}
                </label>
              )}
            </fieldset>
            
          </div>
        }
        { profileData.dimension && profileData.levels.length > 0 &&
          <div className="cms-field-container">
            Measure:
            <div className="bp3-select">
              <select className="field-input" value={profileData.measure} onChange={this.changeField.bind(this, "measure")}>
                <option value="default">Choose One</option>
                {measureOptions}
              </select>
            </div>
          </div>
        }
        <div className="cms-field-container">
          { profileData.dimension && profileData.levels.length > 0 && profileData.measure
            ? <button className="cms-button" onClick={this.createProfile.bind(this)}>Add Dimension</button>
            : <div className="cms-button is-disabled" disabled>Add Dimension</div>
          }
        </div>

      </div>

    );
  }
}

export default DimensionCreator;
