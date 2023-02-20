import axios from "axios";
import url from "url";

const {NEXT_PUBLIC_CMS} = process.env;

const proxy = async(req, res) => {
  const {cmsRoute} = req.query;

  const baseURL = url.resolve(NEXT_PUBLIC_CMS, cmsRoute.join("/"));
  const queryString = url.parse(req.url).query;
  const fullURL = queryString ? `${baseURL}?${queryString}` : baseURL;

  const data = await axios
    .get(fullURL)
    .then(resp => resp.data)
    .catch(error => {
      const {response} = error;
      const errorObject = {...response, request: undefined};
      res.status(response.status);
      return errorObject;
    });
  res.send(data);
};

export default proxy;
