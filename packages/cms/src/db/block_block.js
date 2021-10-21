module.exports = function(sequelize, db) {

  const s = sequelize.define("block_block",
    {
      id: {
        type: db.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      consumer_id: {
        type: db.INTEGER,
        onDelete: "cascade",
        references: {
          model: "canon_cms_block",
          key: "id"
        }
      },
      input_id: {
        type: db.INTEGER,
        onDelete: "cascade",
        references: {
          model: "canon_cms_block",
          key: "id"
        }
      }
    },
    {
      tableName: "canon_cms_block_block",
      freezeTableName: true,
      timestamps: false
    }
  );

  return s;

};
