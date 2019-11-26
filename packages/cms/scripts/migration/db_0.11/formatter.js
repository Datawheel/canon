module.exports = function(sequelize, db) {

  const f = sequelize.define("formatter",
    {
      id: {
        type: db.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: db.STRING,
        defaultValue: ""
      },
      description: {
        type: db.TEXT,
        defaultValue: ""
      },
      logic: {
        type: db.TEXT,
        defaultValue: "return n;"
      }
    },
    {
      tableName: "canon_cms_formatter",
      freezeTableName: true,
      timestamps: false
    }
  );

  return f;

};
