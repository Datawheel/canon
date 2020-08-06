import React, {Component} from "react";
import PropTypes from "prop-types";
import {hot} from "react-hot-loader/root";

import axios from "axios";
import Button from "../../fields/Button.jsx";

class PDFButton extends Component {

  constructor(props) {
    super(props);
    this.state = {
      saving: false
    };
  }

  saveToPDF() {
    const {saving} = this.state;
    const {router} = this.context;
    if (!saving) {
      this.setState({saving: true});
      setTimeout(() => {
        const url = "/api/pdf";
        const path = `${router.location.pathname}?print=true`;
        const payload = {path};
        const config = {responseType: "arraybuffer", headers: {Accept: "application/pdf"}, timeout: 1000 * 60 * 5};
        axios.post(url, payload, config).then(resp => {
          const blob = new Blob([resp.data], {type: "application/pdf"});
          const link = document.createElement("a");
          link.href = window.URL.createObjectURL(blob);
          link.download = "your-file-name.pdf";
          link.click();
          this.setState({saving: false});
        });
      }, 1000);
    }
  }

  render() {
    const {
      className,
      saving
    } = this.props;

    return (
      <Button
        className={className}
        fontSize="xxs"
        icon="document-open"
        onClick={this.saveToPDF.bind(this)}
        rebuilding={saving}
      >
        Download Page as PDF
      </Button>
    );
  }
}

PDFButton.defaultProps = {
  className: ""
};

PDFButton.contextTypes = {
  router: PropTypes.object
};

export default hot(PDFButton);
