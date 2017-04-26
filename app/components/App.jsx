import React, {Component} from "react";
import Nav from "components/Nav";
import Footer from "components/Footer";
import "normalize.css/normalize.css";

class App extends Component {

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

  componentDidMount() {

    document.addEventListener("keydown", () => {

      // 's' key
      if (event.keyCode === 83) {
        if (event.target.tagName !== "INPUT") {
          event.preventDefault();
          this.props.activateSearch();
        }
      }
      // 'esc' key
      else if (event.keyCode === 27) {
        event.preventDefault();
        this.props.activateSearch();
      }
    }, false);

  }
}

export default App;
