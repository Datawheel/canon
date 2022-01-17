import React, {Component, Fragment} from "react";
import {connect} from "react-redux";

import PreviewSearch from "../fields/PreviewSearch";
import Select from "../fields/Select";
import Status from "../interface/Status";

import {setStatus} from "../../actions/status";
import {fetchSectionPreview} from "../../actions/profiles";

import groupMeta from "../../utils/groupMeta";

import "./PreviewHeader.css";

class PreviewHeader extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  componentDidUpdate(prevProps) {
    const {localeDefault, localeSecondary, useLocaleSecondary} = this.props.status;
    const locale = useLocaleSecondary ? localeSecondary : localeDefault;

    // If the sectionPreview is open, then the user may use PreviewHeader to change the previews or the language.
    // Changing either option will fetch new variables, and in turn, cause diffCounter to increment. Upon catching
    // That, kick off a new fetch of the section using the freshly calculated variables.
    if (this.props.status.sectionPreview && prevProps.status.diffCounter !== this.props.status.diffCounter) {
      this.props.fetchSectionPreview(this.props.status.pathObj.section, locale);
    }
  }

  onChange(e) {
    const {localeDefault, localeSecondary, pathObj} = this.props.status;
    // If simply switching between localeDefault and the underlying localeSecondary, just run the fetch
    if (e.target.value === localeDefault) {
      this.props.fetchSectionPreview(pathObj.section, e.target.value);
      this.props.setStatus({useLocaleSecondary: false});
    }
    else if (e.target.value === localeSecondary) {
      this.props.fetchSectionPreview(pathObj.section, e.target.value);
      this.props.setStatus({useLocaleSecondary: true});
    }
    // If the preview language is a new (non default, non secondary) locale, SET the secondaryLocale to that,
    // So when the user closes the window, it has been set in the settings. (note that this will eventually call
    // fetchSectionPreview in componentDidUpdate)
    else {
      this.props.setStatus({localeSecondary: e.target.value, useLocaleSecondary: true});
    }
  }

  render() {
    const {locales, localeDefault, localeSecondary, useLocaleSecondary, previews, fetchingVariables, fetchingSectionPreview} = this.props.status;
    const {meta} = this.props;
    const locale = useLocaleSecondary ? localeSecondary : localeDefault;

    const localeList = locales ? locales.concat([localeDefault]) : [localeDefault];

    const groupedMeta = groupMeta(meta);

    return (
      <Fragment>
        <div className="cms-preview-header">
          {groupedMeta.map((group, i) =>
            <PreviewSearch
              key={`group-${i}`}
              label={previews[i].name || previews[i].id || "search profiles..."}
              previewing={previews[i].name || previews[i].id}
              fontSize="xxs"
              group={group}
              index={i}
              limit={20}
            />
          )}
          {localeList.length > 1 &&
            <Select
              label="Language"
              namespace="cms"
              fontSize="xxs"
              inline
              value={locale}
              onChange={this.onChange.bind(this)}
            >
              {localeList.map(d =>
                <option key={d} value={d}>{d}</option>
              )}
            </Select>
          }
        </div>

        <Status
          recompiling={fetchingVariables || fetchingSectionPreview}
          busy={fetchingVariables ? "Updating variables" : "Updating section preview content"}
        />
      </Fragment>
    );
  }
}

const mapStateToProps = state => ({
  status: state.cms.status,
  meta: state.cms.profiles.find(p => p.id === state.cms.status.currentPid).meta
});

const mapDispatchToProps = dispatch => ({
  setStatus: status => dispatch(setStatus(status)),
  fetchSectionPreview: (id, locale) => dispatch(fetchSectionPreview(id, locale))
});

export default connect(mapStateToProps, mapDispatchToProps)(PreviewHeader);
