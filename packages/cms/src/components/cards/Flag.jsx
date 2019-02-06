import React, {Component} from "react";

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
        {locale}       
      </div>
    );
  }

}

export default Flag;
