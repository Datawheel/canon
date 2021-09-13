import React, {Component} from "react";
import {connect} from "react-redux";
import Board from "react-trello";
import {trello} from "./board.js";
import {newEntity} from "../actions/profiles";

import "./Dnd.css";

class Dnd extends Component {

  cardAdd(cardId, metadata, laneId) {
    console.log(cardId, metadata, laneId);
  }

  render() {

    return <Board
      data={trello}
      editable={true}
      canAddLanes={true}
      onCardAdd={this.cardAdd.bind(this)}
    />;

  }

}

const mapStateToProps = (state, ownProps) => ({
  variables: state.cms.variables,
  status: state.cms.status,
  profile: state.cms.profiles.find(p => p.id === ownProps.id),
  formatters: state.cms.formatters
});

const mapDispatchToProps = dispatch => ({
  newEntity: (type, payload) => dispatch(newEntity(type, payload))
});

export default connect(mapStateToProps, mapDispatchToProps)(Dnd);
