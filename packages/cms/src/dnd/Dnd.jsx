import React, {Component} from "react";
import {connect} from "react-redux";
import "./Dnd.css";
import "@asseinfo/react-kanban/dist/styles.css";
import Board from "react-trello";
import {kanban, trello} from "./board.js";


class Dnd extends Component {

  render() {

    return <Board data={trello} />;

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
            onColumnRename={console.log}
            initialBoard={kanban}
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
