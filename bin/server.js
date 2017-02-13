import axios from "axios";
import gzip from "compression";
import express from "express";
import flash from "express-flash";
import helmet from "helmet";
import path from "path";
import webpack from "webpack";

const appDir = process.cwd();
const env = require(path.join(appDir, "app/.env"));
const store = require(path.join(appDir, "app/store"));

function start() {

  const App = require(path.join(appDir, "static/assets/server"));

  console.log("\n🌐  Starting Express Server\n");
  console.log(`   ⚙️  Environment: ${env.NODE_ENV}`);

  const app = express();

  if (env.NODE_ENV === "development") {
    const webpackDevConfig = require(path.join(__dirname, "../webpack/webpack.config.dev-client"));
    const compiler = webpack(webpackDevConfig);
    app.use(require("webpack-dev-middleware")(compiler, {
      noInfo: true,
      publicPath: webpackDevConfig.output.publicPath
    }));
    app.use(require("webpack-hot-middleware")(compiler));
  }

  app.set("port", env.PORT);

  if (env.NODE_ENV === "production") {
    app.use(gzip());
    app.use(helmet());
  }

  app.use(express.static(path.join(appDir, "static")));

  app.set("trust proxy", "loopback");

  app.use(flash());

  app.get("*", App.default(store));
  app.listen(env.PORT);

  console.log(`   ⚙️  Port: ${env.PORT}`);
  console.log("\n");

}

if (env.ATTRS === void 0) start();
else {

  axios.get(env.ATTRS)
    .then(res => {

      store.attrs = {};

      console.log("\n📚  Caching Attributes\n");

      const promises = res.data.data.map(attr => axios.get(`${env.API}attrs/${attr}`)
        .then(res => {
          console.log(`   ✔️️  Cached ${attr} attributes`);
          store.attrs[attr] = res.data;
          return res;
        })
        .catch(err => {
          console.log(`   ❌  ${env.API}attrs/${attr} errored with code ${err.response.status}`);
          return Promise.reject(err);
        }));

      Promise.all(promises).then(start);

    });

}
