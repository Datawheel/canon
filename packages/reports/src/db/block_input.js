module.exports = function(sequelize, db) {

  const blockInput = sequelize.define("block_input",
    {
      id: {
        type: db.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      block_id: {
        type: db.INTEGER,
        onDelete: "cascade",
        references: {
          model: "canon_reports_block",
          key: "id"
        }
      },
      input_id: {
        type: db.INTEGER,
        onDelete: "cascade",
        references: {
          model: "canon_reports_block",
          key: "id"
        }
      }
    },
    {
      tableName: "canon_reports_block_input",
      freezeTableName: true,
      timestamps: false
    }
  );

  return blockInput;

};
