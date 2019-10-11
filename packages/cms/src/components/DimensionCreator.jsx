import React, {Component} from "react";
import PropTypes from "prop-types";
import Button from "./fields/Button";
import Select from "./fields/Select";
import TextInput from "./fields/TextInput";

import "./DimensionCreator.css";

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
      selectedDimension: {},
      mode: "add"
    };
  }

  componentDidMount() {
    const {meta, cubeData} = this.props;
    if (meta) {
      const selectedDimension = cubeData.find(d => d.cubeName === meta.cubeName && d.dimName === meta.dimension);
      const profileData = {
        id: meta.id,
        slug: meta.slug,
        cubeName: meta.cubeName,
        dimName: meta.dimension,
        dimension: selectedDimension.name,
        hierarchies: selectedDimension.hierarchies,
        levels: meta.levels,
        measure: meta.measure
      };
      const mode = "edit";
      this.setState({selectedDimension, profileData, mode});
    }
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

  saveProfile() {
    const {profileData, mode} = this.state;
    const {meta} = this.props;
    let {takenSlugs} = this.props;
    if (mode === "edit") takenSlugs = takenSlugs.filter(slug => slug !== meta.slug);
    const Toast = this.context.toast.current;
    if (takenSlugs.includes(profileData.slug)) {
      Toast.show({
        intent: "danger",
        message: "Slug already taken. Please choose a different slug.",
        timeout: 2000
      });
    }
    else {
      this.context.onDimensionModify(mode, profileData);
      if (this.props.onComplete) this.props.onComplete();
    }
  }

  render() {

    const {profileData, mode} = this.state;
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
        {mode === "edit" && 
          <div className="cms-dimension-creator-warning">
            <em>Warning: Modifying Dimension Data after creation can break lots of things. Make sure you know what you are doing!</em>
          </div>
        }
        <TextInput
          label="slug"
          inline
          namespace="cms"
          value={profileData.slug}
          onChange={this.changeField.bind(this, "slug")}
        />

        <Select
          label="Dimension"
          inline
          namespace="cms"
          value={profileData.dimension}
          onChange={this.chooseDimension.bind(this)}
        >
          <option value="default">Choose a selector</option>
          {dimOptions}
        </Select>

        {profileData.dimension &&
          <div className="cms-field-container">
            Subdimensions:
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
            namespace="cms"
            value={profileData.measure}
            onChange={this.changeField.bind(this, "measure")}
          >
            <option value="default">Choose a measure</option>
            {measureOptions}
          </Select>
        }

        <div className="cms-field-container">
          {profileData.dimension && profileData.levels.length > 0 && profileData.measure && profileData.measure !== "default"
            ? <Button 
              onClick={this.saveProfile.bind(this)} 
              namespace="cms" 
              icon={mode === "edit" ? "edit" : "plus"}
            >
              {`${mode === "edit" ? "Modify" : "Add"} dimension`}
            </Button>
            : <Button icon="plus" namespace="cms" disabled>{`${mode === "edit" ? "Modify" : "Add"} dimension`}</Button>
          }
        </div>
      </div>
    );
  }
}

DimensionCreator.contextTypes = {
  toast: PropTypes.object,
  onDimensionModify: PropTypes.func
};

export default DimensionCreator;
