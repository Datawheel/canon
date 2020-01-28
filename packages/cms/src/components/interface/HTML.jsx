import React, {Component} from "react";

class HTML extends Component {

  constructor(props) {
    super(props);
    this.state = {
      config: null
    };
  }

  render() {
    const {config} = this.props;
    
    if (!config || !config.html) return null;

    return (
      <div className="cp-html">
        <div dangerouslySetInnerHTML={{_html: config.html}} />
      </div>
    );
  }
}

export default HTML;
