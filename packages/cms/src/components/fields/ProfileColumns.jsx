import React, {Component} from "react";
import ProfileTile from "./ProfileTile";
import {formatCategory} from "../../utils/profileTitleFormat";
import "./ProfileColumns.css";

class ProfileColumns extends Component {

  render() {

    const {columnTitles, data, tileProps} = this.props;

    return (
      <ul key="columns" className="cms-profilecolumns">
        { data.map((data, i) => {
          const profile = data[0].map(d => d.slug).join("/");
          return (
            <li key={`p-${i}`} className="cms-profilecolumn">
              <h3 className="cms-profilecolumn-title" dangerouslySetInnerHTML={{__html: columnTitles[profile] || formatCategory(data)}} />
              <ul className="cms-profilecolumn-list">
                {data.map((result, j) =>
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
  columnTitles: {},
  data: [],
  tileProps: {}
};

export default ProfileColumns;
