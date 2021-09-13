const trello = {
  columns: [
    {
      id: 1,
      title: "Backlog",
      cards: [
        {
          id: 1,
          title: "Add card",
          description: "Add capability to add a card in a column"
        }
      ]
    },
    {
      id: 2,
      title: "Doing",
      cards: [
        {
          id: 2,
          title: "Drag-n-drop support",
          description: "Move a card between the columns"
        }
      ]
    }
  ]
};

module.exports = {trello};
