/**
 * Hook for handling alerts.
 * Receives alert object, returns true when pressed.
 */
const {useState, useEffect} = require("react");

/*
module.exports = alert => {
  const [showAlert, setShowAlert] = useState(null);


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
*/

