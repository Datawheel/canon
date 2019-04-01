import React, {Component} from "react";
import ISO6391 from "iso-639-1";

class Flag extends Component {

  constructor(props) {
    super(props);
    this.state = {

    };
  }

  render() {

    const {locale} = this.props;

    return (
      <div className="cms-flag">
        { ISO6391.getName(locale) }
      </div>
    );
  }

}

export default Flag;
