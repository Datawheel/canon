# @datawheel/canon-core

## Custom Database Models

If you have custom database models that you would like to interact with in API routes, Canon will import any file in a `db/` folder and set up all the associations Sequelize requires. For example, a `db/testTable.js` would look like this:

```js
module.exports = function(sequelize, db) {

  return sequelize.define("testTable",
    {
      id: {
        type: db.INTEGER,
        primaryKey: true
      },
      title: db.STRING,
      favorite: {
        type: db.BOOLEAN,
        allowNull: false,
        defaultValue: false
      }
    }
  );

};
```

*NOTE*: Custom database models are written using Node module syntax, not ES6/JSX.
