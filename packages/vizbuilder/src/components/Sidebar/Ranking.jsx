import React from "react";
import PropTypes from "prop-types";

class Ranking extends React.PureComponent {
  render() {
    const formatting = this.context.formatting;
    const props = this.props;
    const dataset = props.datasets[0];
    const members = props.members[0];
    const query = props.queries[0];

    if (!dataset || !members || !query) return null;

    const measureName = query.measure.name;
    const levelName = query.level.name;
    const timeLevelName = query.timeLevel.name;

    const measureFormatter =
      formatting[query.measure.annotations.units_of_measurement] ||
      formatting["default"];
    const getLevelNames = query.xlevel
      ? a => `${a[levelName]} - ${a[query.xlevel.name]}`
      : a => a[levelName];

    const renderListItem = datapoint => (
      <li className="ranking-item">
        <div className="row">
          <span className="item-label">{getLevelNames(datapoint)}</span>
          <span className="item-value">
            {measureFormatter(datapoint[measureName])}
          </span>
        </div>
      </li>
    );

    const currentYear = new Date().getFullYear();
    const maxTimeMember = members[timeLevelName]
      .filter(year => year <= currentYear)
      .pop();
    const maxTimeDataset = dataset.filter(
      d => d[timeLevelName] == maxTimeMember
    );

    if (maxTimeDataset.length < 20) {
      return (
        <div className="control ranking">
          <p className="label">{`Ranking (${maxTimeMember})`}</p>
          <ol className="ranking-list">{maxTimeDataset.map(renderListItem)}</ol>
        </div>
      );
    }

    const upperDataset = maxTimeDataset.slice(0, 10);
    const lowerIndex = maxTimeDataset.length - 10;
    const lowerDataset = maxTimeDataset.slice(lowerIndex);

    return (
      <div className="control ranking">
        <p className="label">{`Top 10 (${maxTimeMember})`}</p>
        <ol className="ranking-upper">{upperDataset.map(renderListItem)}</ol>
        <p className="label">{`Bottom 10 (${maxTimeMember})`}</p>
        <ol className="ranking-lower" start={lowerIndex + 1}>
          {lowerDataset.map(renderListItem)}
        </ol>
      </div>
    );
  }
}

Ranking.contextTypes = {
  formatting: PropTypes.objectOf(PropTypes.func)
};

export default Ranking;
