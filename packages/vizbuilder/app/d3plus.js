/**
  The object exported by this file will be used as a base config for any
  d3plus-react visualization rendered on the page.
*/

export default {
  legendConfig: {
    shapeConfig: {
      fontColor: "white",
      fontFamily: "Roboto, sans-serif",
      fontResize: false,
      fontSize: 12,
      fontWeight: 400,
      height: () => 20,
      textTransform: "uppercase",
      width: () => 20,
      labelConfig: {
        fontColor: "white"
      }
    }
  },
  shapeConfig: {
    labelConfig: {
      fontFamily: "Roboto"
    }
  }
};
