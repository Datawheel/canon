import React, {Component, Fragment} from "react";
import {hot} from "react-hot-loader/root";

import Stat from "../sections/components/Stat";
import Parse from "../sections/components/Parse";
import "./StatGroup.css";

const sanitize = html => html
  .replace(/\±/g, "<span class='plus-minus'>±</span>")
  .replace(/&lt;/g, "<")
  .replace(/&gt;/g, ">");

class StatGroup extends Component {

  render() {
    const {className, stats} = this.props;

    if (!stats.length) return console.log("`stats` array is empty in StatGroup.jsx");

    return (
      <div className="cp-stat-group">
        {stats.length > 1 &&
          <Parse className="cp-stat-group-title label u-margin-bottom-off">
            {stats[0].title}
          </Parse>
        }
        <ul className="cp-stat-group-list">
          {stats.map((stat, i) =>
            <Stat
              className={className}
              label={stats.length === 1 ? sanitize(stat.title) : null}
              value={sanitize(stat.value)}
              subtitle={sanitize(stat.subtitle)}
              key={i}
            />
          )}
        </ul>
      </div>
    );
  }
}

export default hot(StatGroup);
