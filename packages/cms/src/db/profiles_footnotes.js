module.exports = function(sequelize, db) {

  const p = sequelize.define("profiles_footnotes",
    {
      id: {
        type: db.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      description: {
        type: db.TEXT,
        defaultValue: "New Footnote"
      }, 
      profile_id: {
        type: db.INTEGER,
        onDelete: "cascade",
        references: {
          model: "profiles",
          key: "id"
        }
      },
      ordering: db.INTEGER
    }, 
    {
      freezeTableName: true,
      timestamps: false
    }
  );

  return p;

};
