import React, {Component} from "react";
import "./Topics.css";

class Topics extends Component {

  render() {
    const {data, profile} = this.props;

    return (
      <div className="topics">

        {
          data.map(s =>
            <div className="topic" key={ s.slug }>
              <h2><a name={ s.slug } href={ `#${ s.slug }`}>{ s.title }</a></h2>
              {
                s.sections.map((Comp, i) => {
                  let params = {};
                  if (Array.isArray(Comp)) [Comp, params] = Comp;
                  return React.createElement(Comp, {profile, key: i, ...params}, null);
                })
              }
            </div>
          )
        }

      </div>
    );
  }

}

Topics.defaultProps = {data: [], profile: {}};
export default Topics;
