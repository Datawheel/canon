import React, {Component} from "react";
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

    // used by stat groups to assign flex-grow & min-width
    let colSpan = "2col";
    if (stats.length === 3 || stats.length >= 5) colSpan = "3col";

    return stats.length > 1
      // grouped stats
      ? <div className={`cp-stat-group cp-${colSpan}-stat-group`}>
        {stats.length > 1 &&
          <Parse className="cp-stat-group-title label u-margin-bottom-off">
            {stats[0].title}
          </Parse>
        }
        <ul className="cp-stat-group-list">
          {stats.map((stat, i) =>
            <Stat
              className={className}
              label={null}
              value={sanitize(stat.value)}
              subtitle={sanitize(stat.subtitle)}
              key={i}
            />
          )}
        </ul>
      </div>
      // single stat
      : <Stat El="p"
        className={className}
        label={sanitize(stats[0].title)}
        value={sanitize(stats[0].value)}
        subtitle={sanitize(stats[0].subtitle)}
      />
    ;
  }
}

export default hot(StatGroup);
