import axios from "axios";

function fetchData(key, url, format = d => d, config = {}) {

  const returnFunction = (params, store) => {

    let u = url.indexOf("http") === 0 ? url : `${store.env.CANON_API}${url}`;

    (url.match(/<[^\&\=\/>]+>/g) || []).forEach(variable => {
      let x = variable.slice(1, -1).split(".");
      if (params[x[0]]) x = params[x[0]];
      else if (store.data && store.data[x[0]]) x = x.reduce((o, i) => o[i], store.data);
      else if (store[x[0]]) x = x.reduce((o, i) => o[i], store);
      else x = false;
      if (x && typeof x !== "object") u = u.replace(variable, x);
    });

    return {
      type: "GET_DATA",
      promise: axios.get(u, config).then(res => ({key, data: format(res.data)})),
      description: u
    };

  };
  returnFunction.key = key;

  return returnFunction;

}

export {fetchData};
