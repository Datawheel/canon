import React, {Component} from "react";
import {connect} from "react-redux";
import {InputGroup, Tooltip, Button} from "@blueprintjs/core";
import {addCustomUrl, removeCustomUrl} from "../actions/example";
import {addToCartAction, AddToCartControl} from "../../src/";
import "./CustomAddUrls.css";

/**
  This component is displayed when the needs of another component are being
  loaded into the redux store.
*/
class CustomAddUrls extends Component {

  constructor(props) {
    super(props);
    this.state = {
      urlValue: "",
    }
    this.handleTextChange = this.handleTextChange.bind(this);
    this.handleAddClick = this.handleAddClick.bind(this);
    this.addAvailable = this.addAvailable.bind(this);
    this.removeButton = this.removeButton.bind(this);
  }

  handleTextChange(textEvent) {
    this.setState({urlValue:textEvent.currentTarget.value});
  };

  handleAddClick() {
    const {urlValue} = this.state;
    const {dispatch} = this.props;
    dispatch(addToCartAction(urlValue));
    dispatch(addCustomUrl(urlValue));
  };

  addAvailable(urlValue) {
    const {activeSiteObject} = this.props;
    let valid = false;
    if (urlValue.indexOf(activeSiteObject.base)===0){
      valid = true;
    }
    //TODO validate complete url
    return valid;
  }


  removeButton(url) {
    return (
      <AddToCartControl query={url} />
    );
  }

  render() {
    const {urlValue} = this.state;
    const {activeSiteObject, customUrls} = this.props;
    const addValid = this.addAvailable(urlValue);

    const addButton = (
      <Tooltip content={`Add url to cart`}>
        <Button
          disabled={!addValid}
          icon={"add"}
          minimal={true}
          onClick={this.handleAddClick}
        />
      </Tooltip>
    );

    return (<div>
      <InputGroup
        large={true}
        leftIcon="link"
        onChange={this.handleTextChange}
        placeholder="Url to add"
        rightElement={addButton}
        value={urlValue}
      />
      <p>Must start with "{activeSiteObject.base}"</p>
      <hr/>
      {customUrls && <div>
        <p>{customUrls.length} urls</p>
        <hr/>
        {customUrls.map(url=>
          <InputGroup
            large={true}
            leftIcon="link"
            disabled={true}
            rightElement={this.removeButton(url)}
            value={url}
          />
        )}
        </div>}
    </div>);
  }
}

export default
  connect(state => ({
    activeSiteObject: state.data.home_data ? state.data.home_data : false,
    customUrls: state.example.customUrls
  }))(CustomAddUrls);
