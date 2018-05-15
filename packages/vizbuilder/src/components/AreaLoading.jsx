import React from "react";
import {Client as MondrianClient} from 'mondrian-rest-client';

var client;

class AreaLoading extends React.PureComponent {
	constructor(props) {
		super();
		client = new MondrianClient(props.src);
	}

	shouldComponentUpdate() {

		return false;
	}

	render() {
		return null;
	}
}

export default AreaLoading;
