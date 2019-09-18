import React from "react";
import PropTypes from "prop-types";

class Ranking extends React.PureComponent {
  render() {
    const {chart, selectedTime} = this.props;
    const {dataset, formatter, names, query} = chart || {};

    if (!dataset || !dataset.length) return null;

    const {measureName, timeLevelName} = names;

    const levelNames = query.levels.map(lvl => lvl.name);
    const getLevelNames = a => levelNames.map(name => a[name]).join(" - ");

    const renderListItem = datapoint => (
      <li className="ranking-item">
        <div className="row">
          <span className="item-label">{getLevelNames(datapoint)}</span>
          <span className="item-value">
            {formatter(datapoint[measureName])}
          </span>
        </div>
      </li>
    );

    const selectedTimeDataset = dataset.filter(
      d => d[timeLevelName] == selectedTime
    );

    if (selectedTimeDataset.length === 1) {
      return null;
    }

    if (selectedTimeDataset.length < 20) {
      return (
        <div className="control ranking">
          <p className="label">{`Ranking (${selectedTime})`}</p>
          <ol className="ranking-list">
            {selectedTimeDataset.map(renderListItem)}
          </ol>
        </div>
      );
    }

    const upperDataset = selectedTimeDataset.slice(0, 10);
    const lowerIndex = selectedTimeDataset.length - 10;
    const lowerDataset = selectedTimeDataset.slice(lowerIndex);

    return (
      <div className="control ranking">
        <p className="label">{`Top 10 (${selectedTime})`}</p>
        <ol className="ranking-upper">{upperDataset.map(renderListItem)}</ol>
        <p className="label">{`Bottom 10 (${selectedTime})`}</p>
        <ol className="ranking-lower" start={lowerIndex + 1}>
          {lowerDataset.map(renderListItem)}
        </ol>
      </div>
    );
  }
}

Ranking.contextTypes = {
  generalConfig: PropTypes.object
};

export default Ranking;
