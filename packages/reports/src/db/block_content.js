module.exports = function(sequelize, db) {

  return sequelize.define("block_content",
    {
      id: {
        type: db.INTEGER,
        primaryKey: true,
        onDelete: "cascade",
        references: {
          model: "canon_reports_block",
          key: "id"
        }
      },
      locale: {
        type: db.STRING,
        primaryKey: true
      },
      content: {
        type: db.JSON,
        defaultValue: {}
      }
    },
    {
      tableName: "canon_reports_block_content",
      freezeTableName: true,
      timestamps: false
    }
  );

};