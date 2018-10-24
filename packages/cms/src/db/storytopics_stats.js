module.exports = function(sequelize, db) {

  const s = sequelize.define("storytopics_stats",
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
        type: db.STRING,
        defaultValue: "New Subtitle"
      },      
      value: {
        type: db.STRING,
        defaultValue: "New Value"
      },      
      storytopic_id: {
        type: db.INTEGER,
        onDelete: "cascade",
        references: {
          model: "storytopics",
          key: "id"
        }
      },
      tooltip: {
        type: db.STRING,
        defaultValue: "New Tooltip"
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
