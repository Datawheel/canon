module.exports = function(sequelize, db) {

  const f = sequelize.define("formatters",
    {
      id: {
        type: db.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: db.STRING, 
        defaultValue: "New Formatter"
      },
      description: db.TEXT,
      logic: {
        type: db.TEXT,
        defaultValue: "return {}"
      }
    }, 
    {
      freezeTableName: true,
      timestamps: false
    }
  );

  return f;

};
