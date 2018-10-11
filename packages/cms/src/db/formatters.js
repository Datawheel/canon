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
      description: {
        type: db.TEXT,
        defaultValue: "New Description"
      },
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

  f.seed = [
    {
      
    }
  ];

  return f;

};
