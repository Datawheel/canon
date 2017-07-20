import React, {Component} from "react";
import {connect} from "react-redux";
import Nav from "components/Nav";
import Footer from "components/Footer";
import "normalize.css/normalize.css";

import {isAuthenticated} from "../../src";

class App extends Component {

  static contextTypes = {
    mondrianClient: React.PropTypes.object.isRequired,
  }

  constructor(props) {
    super(props);
  }

  componentWillMount() {
    this.props.isAuthenticated();
  }

  render() {
    const {children} = this.props;
    return (
      <div className="container">
        <Nav />
        { children }
        <Footer />
      </div>
    );
  }

}

const mapDispatchToProps = dispatch => ({
  isAuthenticated: () => {
    dispatch(isAuthenticated());
  }
});

export default connect(() => ({}), mapDispatchToProps)(App);
