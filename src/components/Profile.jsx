import React, {Component} from "react";

class Profile extends Component {

  getChildContext() {
    return {
      d3plus: this.props.d3plus || {},
      data: this.props.data || {}
    };
  }

}

Profile.childContextTypes = {
  data: React.PropTypes.object,
  d3plus: React.PropTypes.object
};

export default Profile;
