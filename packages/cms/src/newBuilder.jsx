import React, {useState, useEffect} from "react";
import {useDispatch, useSelector} from "react-redux";

import {fetchData, isAuthenticated} from "@datawheel/canon-core";
import {getFormatters} from "./actions/formatters";

/**
 *
 */
function NewBuilder(props) {

  const [count, setCount] = useState(0);
  useEffect(() => {
    document.title = `You clicked ${count} times`;
  });

  const [userInit, setUserInit] = useState(false);
  useEffect(() => {

  });

  const dispatch = useDispatch();

  const [auth, formatterFunctions] = useSelector(state => [state.auth, state.cms.resources.formatterFunctions]);
  useEffect(() => {
    dispatch(isAuthenticated());
    dispatch(getFormatters());
  }, []);

  console.log("Jim", props);

  if (!formatterFunctions) return <div>Loading...</div>;

  // The CMS is only accessible on localhost/dev. Redirect the user to root otherwise.

  // if (!isEnabled && typeof window !== "undefined" && window.location.pathname !== "/") window.location = "/";


  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
      Click me
      </button>
    </div>
  );



}

NewBuilder.need = [
  fetchData("isEnabled", "/api/cms"),
  fetchData("minRole", "/api/cms/minRole")
];

export default NewBuilder;
