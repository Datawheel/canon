import React from "react";

import AreaLoading from "./components/AreaLoading";
import AreaSidebar from "./components/AreaSidebar";
import AreaChart from "./components/AreaChart";

import LOADINGSTATE from "./helpers/loading";

class Vizbuilder extends React.PureComponent {
	state = {
		loadingState: LOADINGSTATE.EMPTY,
		query: {},
		dataset: []
	};

	queryCallback = query => {
		this.setState({ query });
	};

	dataCallback = dataset => {
		this.setState({ dataset });
	};

	render() {
		return (
			<div className="vizbuilder">
				<AreaLoading src={this.props.src} onChange={this.dataCallback} />
				<AreaSidebar onChange={this.queryCallback} />
				<AreaChart />
			</div>
		);
	}
}

export default Vizbuilder;
