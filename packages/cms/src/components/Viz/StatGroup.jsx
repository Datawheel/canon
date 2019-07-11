import React, {Component} from "react";
import Stat from "../sections/components/Stat";
import "./StatGroup.css";

const sanitize = html => html
  .replace(/\±/g, "<span class='plus-minus'>±</span>")
  .replace(/&lt;/g, "<")
  .replace(/&gt;/g, ">");

export default class StatGroup extends Component {

  render() {
    const {stats} = this.props;

    return <React.Fragment>
      {stats.length && stats.map((stat, i) =>
        <Stat
          label={sanitize(stat.title)}
          value={sanitize(stat.value)}
          qualifier={sanitize(stat.subtitle)}
          key={i}
        />
      )}
    </React.Fragment>;
  }
}
