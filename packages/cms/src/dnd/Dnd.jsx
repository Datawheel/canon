import React, {Component} from "react";
import {connect} from "react-redux";
import {trello} from "./board.js";
import {newEntity} from "../actions/profiles";

import "@asseinfo/react-kanban/dist/styles.css";
import "./Dnd.css";

class Dnd extends Component {

  cardAdd(cardId, metadata, laneId) {
    console.log(cardId, metadata, laneId);
  }

  render() {

    if (typeof window !== "undefined") {
      const Board = require("@asseinfo/react-kanban").default;

      return <div id="dnd-container">
        <Board
          initialBoard={trello}
          allowRemoveColumn
          allowRenameColumn
          allowRemoveCard
          onColumnRemove={console.log}
          onCardRemove={console.log}
          onLaneRename={console.log}
          allowAddCard={{on: "top"}}
          onNewCardConfirm={draftCard => ({
            id: new Date().getTime(),
            ...draftCard
          })}
          onCardNew={console.log}
        />
      </div>;
    }
    else {
      return "Loading...";
    }

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
