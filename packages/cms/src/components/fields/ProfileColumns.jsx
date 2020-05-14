import React, {Component} from "react";
import ProfileTile from "./ProfileTile";
import "./ProfileColumns.css";

class ProfileColumns extends Component {

  render() {

    const {columnFormat, columnTitles, data, joiner, tileProps} = this.props;

    return (
      <ul key="columns" className="cms-profilecolumns">
        { data.map((datum, i) => {
          const profile = datum[0].map(d => d.slug).join("/");
          return (
            <li key={`p-${i}`} className="cms-profilecolumn">
              <h3 className="cms-profilecolumn-title" dangerouslySetInnerHTML={{__html: columnTitles[profile] || datum[0].map(columnFormat).join(joiner)}} />
              <ul className="cms-profilecolumn-list">
                {datum.map((result, j) =>
                  <ProfileTile key={`r-${j}`} {...tileProps} data={result} />)}
              </ul>
            </li>
          );
        })
        }
      </ul>
    );
  }

}

ProfileColumns.defaultProps = {
  columnFormat: d => d.memberHierarchy,
  columnTitles: {},
  data: [],
  joiner: " & ",
  tileProps: {}
};

export default ProfileColumns;
