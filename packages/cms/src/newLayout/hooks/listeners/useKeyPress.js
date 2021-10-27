const {useState, useEffect} = require("react");

module.exports = targetKey => {
  const [keyPressed, setKeyPressed] = useState(false);
  const downHandler = press => {
    if (press.keyCode === targetKey) setKeyPressed(true);
  };
  const upHandler = press => {
    if (press.keyCode === targetKey) setKeyPressed(false);
  };
  useEffect(() => {
    window.addEventListener("keydown", downHandler);
    window.addEventListener("keyup", upHandler);
    return () => {
      window.removeEventListener("keydown", downHandler);
      window.removeEventListener("keyup", upHandler);
    };
  }, []);
  return keyPressed;
};
