import React, {Component} from "react";
import Stat from "../sections/components/Stat";
import "./StatGroup.css";

const sanitize = html => html
  .replace(/\±/g, "<span class='plus-minus'>±</span>")
  .replace(/&lt;/g, "<")
  .replace(/&gt;/g, ">");

export default class StatGroup extends Component {

  render() {
    const {className, stats} = this.props;

    return <React.Fragment>
      {stats.length && stats.map((stat, i) =>
        <Stat
          className={className}
          label={sanitize(stat.title)}
          value={sanitize(stat.value)}
          subtitle={sanitize(stat.subtitle)}
          key={i}
        />
      )}
    </React.Fragment>;
  }
}
