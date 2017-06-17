import React, {Component} from "react";
import Nav from "components/Nav";
import Footer from "components/Footer";
import "normalize.css/normalize.css";

export default class App extends Component {

  constructor(props) {
    super(props);
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
