import axios from "axios";

/** */
export function getFormatters() { 
  return function(dispatch) {
    return axios.get("/api/cms/formatter")
      .then(({data}) => {
        dispatch({type: "FORMATTER_GET", data});
      });
  };
}

/** */
export function newFormatter(payload) { 
  return function(dispatch) {
    return axios.post("/api/cms/formatter/new", payload)
      .then(({data}) => {
        dispatch({type: "FORMATTER_NEW", data});
      });
  };
}

/** */
export function updateFormatter(payload) { 
  return function(dispatch) {
    return axios.post("/api/cms/formatter/update", payload)
      .then(({data}) => {
        dispatch({type: "FORMATTER_UPDATE", data});
      });
  };
}

/** */
export function deleteFormatter(id) { 
  return function(dispatch) {
    axios.delete("/api/cms/formatter/delete", {params: {id}})
      .then(({data}) => {
        dispatch({type: "FORMATTER_DELETE", data});
      });
  };
}

