import React, {Component} from "react";
import {MenuItem} from "@blueprintjs/core";
import {MultiSelect} from "@blueprintjs/select";
import Button from "./fields/Button";
import Select from "./fields/Select";
import TextInput from "./fields/TextInput";

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
        <TextInput
          label="slug"
          inline
          context="cms"
          value={profileData.slug}
          onChange={this.changeField.bind(this, "slug")}
        />

        <Select
          label="Dimension"
          inline
          context="cms"
          value={profileData.dimension}
          onChange={this.chooseDimension.bind(this)}
        >
          <option value="default">Choose a selector</option>
          {dimOptions}
        </Select>

        {profileData.dimension &&
          <div className="cms-field-container">
            Levels:
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

        {profileData.dimension && profileData.levels.length > 0 &&
          <Select
            label="Measure"
            inline
            context="cms"
            value={profileData.measure}
            onChange={this.changeField.bind(this, "measure")}
          >
            <option value="default">Choose a measure</option>
            {measureOptions}
          </Select>
        }

        <div className="cms-field-container">
          {profileData.dimension && profileData.levels.length > 0 && profileData.measure
            ? <Button onClick={this.createProfile.bind(this)} context="cms" icon="plus">Add dimension</Button>
            : <Button icon="plus" context="cms" disabled>Add dimension</Button>
          }
        </div>
      </div>
    );
  }
}

export default DimensionCreator;
