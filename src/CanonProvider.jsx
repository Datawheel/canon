import React, {Component} from "react";
import PropTypes from "prop-types";
import {I18nextProvider} from "react-i18next";
import {Provider} from "react-redux";

class CanonProvider extends Component {

  getChildContext() {
    const {helmet, locale} = this.props;
    return {helmet, locale};
  }

  render() {
    const {children, i18n, store} = this.props;
    return <I18nextProvider i18n={i18n}>
      <Provider store={store}>
        { children }
      </Provider>
    </I18nextProvider>;
  }
}

CanonProvider.childContextTypes = {
  helmet: PropTypes.object,
  locale: PropTypes.string
};

CanonProvider.defaultProps = {
  helmet: {}
};

export default CanonProvider;
