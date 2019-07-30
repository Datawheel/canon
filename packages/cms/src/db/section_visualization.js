module.exports = function(sequelize, db) {

  const v = sequelize.define("section_visualization",
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
      section_id: {
        type: db.INTEGER,
        onDelete: "cascade",
        references: {
          model: "canon_cms_section",
          key: "id"
        }
      },
      allowed: {
        type: db.STRING,
        defaultValue: "always"
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
      tableName: "canon_cms_section_visualization",
      freezeTableName: true,
      timestamps: false
    }
  );

  return v;

};
