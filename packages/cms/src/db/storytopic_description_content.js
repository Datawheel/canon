module.exports = function(sequelize, db) {

  const s = sequelize.define("storytopic_description_content",
    {
      id: {
        type: db.INTEGER,
        primaryKey: true
      },
      lang: {
        type: db.STRING,
        primaryKey: true
      },
      description: {
        type: db.TEXT,
        defaultValue: "New Description"
      },
      parent_id: {
        type: db.INTEGER,
        onDelete: "cascade",
        references: {
          model: "storytopic_description",
          key: "id"
        }
      }
    }, 
    {
      freezeTableName: true,
      timestamps: false
    }
  );

  return s;

};
