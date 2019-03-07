module.exports = function(sequelize, db) {

  const s = sequelize.define("storytopic_visualization",
    {
      id: {
        type: db.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      logic: {
        type: db.TEXT,
        defaultValue: "return {}"
      },      
      storytopic_id: {
        type: db.INTEGER,
        onDelete: "cascade",
        references: {
          model: "canon_cms_storytopic",
          key: "id"
        }
      },
      ordering: db.INTEGER
    }, 
    {
      tableName: "canon_cms_storytopic_visualization",
      freezeTableName: true,
      timestamps: false
    }
  );

  return s;

};
