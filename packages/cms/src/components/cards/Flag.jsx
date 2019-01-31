import React, {Component} from "react";

class Flag extends Component {

  constructor(props) {
    super(props);
    this.state = {
      
    };
  }

  render() {

    const {locale} = this.props;

    const lookup = {
      pt: "🇧🇷",
      es: "🇪🇸",
      ru: "🇷🇺"
    };

    return (
      <div className="cms-flag">
        {lookup[locale]}       
      </div>
    );
  }

}

export default Flag;
