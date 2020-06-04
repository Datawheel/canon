# @datawheel/canon-core

## Custom API Routes

If you app requires custom API routes, Canon will import any files located in a `api/` directory and attach them to the current Express instance. For example, a file located at `api/simpleRoute.js`:

```js
module.exports = function(app) {

  app.get("/api/simple", (req, res) => {

    res.json({simple: true}).end();

  });

};
```

*NOTE*: Custom API routes are written using Node module syntax, not ES6/JSX.

If you'd like to interact with the database in a route, the Express app contains the Sequelize instance as part of it's settings:

```js
module.exports = function(app) {

  const {db} = app.settings;

  app.get("/api/user", (req, res) => {

    db.users.findAll({where: req.query}).then(u => res.json(u).end());

  });

};
```

Additionally, if you would like certain routes to only be reachable if a user is logged in, you can use this simple middleware to reject users that are not logged in:

```js
const authRoute = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  return res.status(401).send("you are not logged in...");
};

module.exports = function(app) {

  app.get("/api/authenticated", authRoute, (req, res) => {

    res.status(202).send("you are logged in!").end();

  });

};
```
