module.exports = function(sequelize, db) {

  const s = sequelize.define("topic_selector",
    {
      topic_id: {
        type: db.INTEGER,
        primaryKey: true,
        onDelete: "cascade",
        references: {
          model: "canon_cms_topic",
          key: "id"
        }
      },
      selector_id: {
        type: db.INTEGER,
        primaryKey: true,
        onDelete: "cascade",
        references: {
          model: "canon_cms_selector",
          key: "id"
        }
      },
      ordering: db.INTEGER
    },
    {
      tableName: "canon_cms_topic_selector",
      freezeTableName: true,
      timestamps: false
    }
  );

  return s;

};
