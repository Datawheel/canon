module.exports = function(sequelize, db) {

  const s = sequelize.define("storysection_visualization",
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
      storysection_id: {
        type: db.INTEGER,
        onDelete: "cascade",
        references: {
          model: "canon_cms_storysection",
          key: "id"
        }
      },
      logic_simple: {
        type: db.JSON,
        defaultValue: null
      },
      simple: {
        type: db.BOOLEAN,
        defaultValue: true
      },      
      ordering: db.INTEGER
    }, 
    {
      tableName: "canon_cms_storysection_visualization",
      freezeTableName: true,
      timestamps: false
    }
  );

  return s;

};
