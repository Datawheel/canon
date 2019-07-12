module.exports = function(sequelize, db) {

  const s = sequelize.define("profile_stat",
    {
      id: {
        type: db.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      title: {
        type: db.STRING,
        defaultValue: "New Stat"
      },
      subtitle: {
        type: db.TEXT,
        defaultValue: "New Subtitle"
      },
      value: {
        type: db.STRING,
        defaultValue: "New Value"
      },
      profile_id: {
        type: db.INTEGER,
        onDelete: "cascade",
        references: {
          model: "profile",
          key: "id"
        }
      },
      tooltip: {
        type: db.TEXT,
        defaultValue: "New Tooltip"
      },
      allowed: {
        type: db.STRING,
        defaultValue: "always"
      },      
      ordering: db.INTEGER
    }, 
    {
      freezeTableName: true,
      timestamps: false
    }
  );

  return s;

};
