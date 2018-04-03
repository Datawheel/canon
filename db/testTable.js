module.exports = function(sequelize, db) {

  return sequelize.define("testTable",
    {
      id: {
        type: db.STRING,
        primaryKey: true
      },
      username: db.STRING,
      email: db.STRING,
      name: db.STRING,
      password: db.STRING,
      salt: db.STRING,
      facebook: db.STRING,
      github: db.STRING,
      google: db.STRING,
      instagram: db.STRING,
      twitter: db.STRING
    }
  );

};
