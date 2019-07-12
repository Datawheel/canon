module.exports = function(sequelize, db) {

  const p = sequelize.define("profile_footnote",
    {
      id: {
        type: db.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      title: {
        type: db.STRING,
        defaultValue: "New Title"
      },
      description: {
        type: db.TEXT,
        defaultValue: "New Footnote"
      }, 
      profile_id: {
        type: db.INTEGER,
        onDelete: "cascade",
        references: {
          model: "profile",
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
