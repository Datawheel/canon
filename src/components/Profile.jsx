import React, {Component} from "react";

class Profile extends Component {

  getChildContext() {
    return {
      data: this.props.data
    };
  }

}

Profile.childContextTypes = {
  data: React.PropTypes.object
};

export default Profile;
