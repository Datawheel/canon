import axios from "axios";
import url from "url";

import generateToken from "../../../helpers/generateToken";

const {NEXT_PUBLIC_TESSERACT} = process.env;

const proxy = async(req, res) => {
  const {route} = req.query;

  const baseURL = url.resolve(NEXT_PUBLIC_TESSERACT, route);
  const queryString = url.parse(req.url).query;
  const fullURL = queryString ? `${baseURL}?${queryString}` : baseURL;

  const config = {
    headers: {
      "x-tesseract-jwt-token": generateToken()
    }
  };

  const data = await axios
    .get(fullURL, config)
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
