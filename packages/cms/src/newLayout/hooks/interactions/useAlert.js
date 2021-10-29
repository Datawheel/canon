/**
 * Hook for handling alerts.
 * Receives alert object, returns true when pressed.
 */
const {useState, useEffect} = require("react");

module.exports = () => {
  const [showAlert, setShowAlert] = useState(null);

  useEffect(() => {

  }, [showAlert]);

  const setAlert = message => {
    setShowAlert(true);
    // open alert
  };

  return [showAlert, setAlert];
};


