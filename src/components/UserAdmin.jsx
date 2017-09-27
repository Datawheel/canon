import React, {Component} from "react";
import {connect} from "react-redux";
import {translate} from "react-i18next";
import axios from "axios";

class UserAdmin extends Component {

  constructor(props) {
    super(props);
    this.state = {
      users: []
    };
  }

  componentDidMount() {
    axios.get("/auth/users").then(res => this.setState({users: res.data}));
  }

  onChangeRole(event, user) {
    const role = event.target.value;
    user.role = false;
    this.forceUpdate();
    axios.post(`/auth/users/update?id=${user.id}&role=${role}`).then(() => {
      user.role = role;
      this.forceUpdate();
    });
  }

  render() {

    const {t} = this.props;
    const {users} = this.state;

    return <table className="pt-table pt-striped">
      <thead>
        <tr>
          <th>{ t("Username") }</th>
          <th>{ t("Role") }</th>
        </tr>
      </thead>
      <tbody>
        { users.map(user => <tr key={ user.id }>
          <td>{ user.username }</td>
          <td>
            <select value={ user.role } onChange={event => this.onChangeRole.bind(this)(event, user)} disabled={ user.role === false }>
              <option value="0">{ t("User") }</option>
              <option value="1">{ t("Contributor") }</option>
              <option value="2">{ t("Admin") }</option>
            </select>
          </td>
        </tr>) }
      </tbody>
    </table>;
  }
}

UserAdmin = translate()(UserAdmin);
UserAdmin = connect(state => ({
  auth: state.auth
}))(UserAdmin);
export {UserAdmin};
