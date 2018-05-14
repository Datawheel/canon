import React from "react";

import LOADINGSTATE from "./helpers/loading";

class Vizbuilder extends React.PureComponent {
	state = {
		loadingState: LOADINGSTATE.EMPTY,
		query: {},
		dataset: []
	};

	stateCallback = state => {
		this.setState({ loadingState: state });
	};

	queryCallback = query => {
		this.setState({ query });
	};

	dataCallback = dataset => {
		this.setState({ dataset });
	};

	render() {
		return <div>Test</div>;
	}
}

export default Vizbuilder;
