import axios from "axios";
import React, {Component} from "react";

class MemberBuilder extends Component {

  constructor(props) {
    super(props);
    this.state = {
      members: []
    };
  }

  componentDidMount() {
    this.hitDB.bind(this)();
  }

  hitDB() {
    /*
    axios.get(`/api/cms/profile/get/${this.props.id}`).then(resp => {
      this.setState({minData: resp.data});
    });
    */
  }

  render() {

    const {members} = this.state;

    return (
      <div className="cms-panel member-panel">
        im a member builder
      </div>
    );
  }
}

export default MemberBuilder;
