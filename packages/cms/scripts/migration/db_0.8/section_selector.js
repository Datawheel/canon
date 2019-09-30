module.exports = function(sequelize, db) {

  const s = sequelize.define("section_selector",
    {
      id: {
        type: db.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      section_id: {
        type: db.INTEGER,
        onDelete: "cascade",
        references: {
          model: "canon_cms_section",
          key: "id"
        }
      },
      selector_id: {
        type: db.INTEGER,
        onDelete: "cascade",
        references: {
          model: "canon_cms_selector",
          key: "id"
        }
      },
      ordering: db.INTEGER
    },
    {
      tableName: "canon_cms_section_selector",
      freezeTableName: true,
      timestamps: false
    }
  );

  return s;

};
