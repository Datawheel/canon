import React, {Component} from "react";
import {connect} from "react-redux";
import PreviewSearch from "../fields/PreviewSearch";

class PreviewHeader extends Component {

  constructor(props) {
    super(props);
    this.state = {
      
    };
  }

  render() {

    const {previews} = this.props.status;
    const {meta} = this.props;

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
