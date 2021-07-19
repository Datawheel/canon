import React, {Component} from "react";
import PropTypes from "prop-types";
import {withNamespaces} from "react-i18next";

import axios from "axios";
import {saveAs} from "file-saver";
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
    if (!saving) {

      const {router} = this.context;
      const {location} = router;
      const {query} = location;
      const pathname = this.props.pathname || location.pathname;
      const {filename, pdfOptions, viewportOptions} = this.props;

      const queryString = Object.entries({...query, print: true}).map(([key, val]) => `${key}=${val}`).join("&");
      const path = `${pathname}?${queryString}`;
      const config = {responseType: "arraybuffer", headers: {Accept: "application/pdf"}};
      const callback = resp => {
        const blob = new Blob([resp.data], {type: "application/pdf"});
        saveAs(blob, `${filename}.pdf`);
        this.setState({saving: false});
      };

      const requiresPost = pdfOptions || viewportOptions;

      if (requiresPost) {
        const url = "/api/pdf";
        const payload = {path, pdfOptions, viewportOptions};
        this.setState({saving: true});
        axios.post(url, payload, config).then(callback);
      }
      else {
        const url = `/api/pdf/get?path=${encodeURIComponent(path)}`;
        this.setState({saving: true});
        axios.get(url, config).then(callback);
      }
    }
  }

  render() {

    const {
      className,
      text,
      t
    } = this.props;

    const {saving} = this.state;

    const label = text || t("CMS.Profile.Download Page as PDF");

    return (
      <Button
        className={className}
        fontSize="xxs"
        icon="document-open"
        onClick={this.saveToPDF.bind(this)}
        rebuilding={saving}
      >
        {label}
      </Button>
    );
  }
}

PDFButton.defaultProps = {
  className: "",
  filename: "your-file-name"
};

PDFButton.contextTypes = {
  router: PropTypes.object
};

export default withNamespaces()(PDFButton);
