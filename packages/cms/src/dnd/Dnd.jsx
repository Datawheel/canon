import React, {Component} from "react";
import {connect} from "react-redux";
import "./Dnd.css";
import "@asseinfo/react-kanban/dist/styles.css";
import {default as board} from "./board.js";

class Dnd extends Component {

  render() {

    if (typeof window !== "undefined") {
      const Board = require("@asseinfo/react-kanban").default;
      return (
        <div id="dnd-container">
          <Board
            allowRemoveColumn
            allowRenameColumn
            allowRemoveCard
            onColumnRemove={console.log}
            onCardRemove={console.log}
            onLaneRename={console.log}
            initialBoard={board}
            allowAddCard={{on: "top"}}
            onNewCardConfirm={draftCard => ({
              id: new Date().getTime(),
              ...draftCard
            })}
            onCardNew={console.log}
          />
        </div>
      );
    }
    else {
      return "Loading";
    }
  }

}

export default connect(state => ({

  /*
  stories: state.data.stories
  */
}))(Dnd);
