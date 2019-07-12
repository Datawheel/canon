module.exports = function(sequelize, db) {

  const s = sequelize.define("storytopic_description",
    {
      id: {
        type: db.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      description: {
        type: db.TEXT,
        defaultValue: "New Description"
      },
      storytopic_id: {
        type: db.INTEGER,
        onDelete: "cascade",
        references: {
          model: "storytopic",
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

  return s;

};
