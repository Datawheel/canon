const React = require("react");

module.exports = {
  decorators: [
    {
      strategy: (contentBlock, callback, contentState) => {
        contentBlock.findEntityRanges(
          character => {
            const entityKey = character.getEntity();
            return (
              entityKey !== null &&
                  contentState.getEntity(entityKey).getType() === "LINK"
            );
          },
          callback
        );
      },
      component(props) {
        const {url} = props.contentState.getEntity(props.entityKey).getData();
        return (
          <a href={url} key="url" target="_blank" rel="noreferrer" style={{color: "#3b5998", textDecoration: "underline"}}>
            {props.children}
          </a>
        );
      }
    }
  ]
};
