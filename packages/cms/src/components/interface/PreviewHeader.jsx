import React, {Component} from "react";
import {connect} from "react-redux";
import PreviewSearch from "../fields/PreviewSearch";
import Select from "../fields/Select";

class PreviewHeader extends Component {

  constructor(props) {
    super(props);
    this.state = {
      locale: props.status.localeDefault
    };
  }

  render() {

    const {locales, localeDefault, previews} = this.props.status;
    const {meta} = this.props;
    const {locale} = this.state;

    const localeList = locales.concat([localeDefault]);

    return (
      <div>
        {meta.map((m, i) => 
          <PreviewSearch
            key={`ps-${m.slug}`}
            label={previews[i].name || previews[i].id || "search profiles..."}
            previewing={previews[i].name || previews[i].id}
            fontSize="xxs"
            slug={m.slug}
            dimension={m.dimension}
            levels={m.levels}
            limit={20}
          />
        )}
        <Select
          label="Language"
          namespace="cms"
          fontSize="xs"
          inline
          value={locale}
          onChange={e => this.setState({locale: e.target.value})}
        >
          {localeList.map(d => <option key={d} value={d}>{d}</option>)}
        </Select>

      </div>
      
    );
  }

}

const mapStateToProps = state => ({
  status: state.cms.status,
  meta: state.cms.profiles.find(p => p.id === state.cms.status.currentPid).meta
});

const mapDispatchToProps = dispatch => ({
  
});

export default connect(mapStateToProps, mapDispatchToProps)(PreviewHeader);
