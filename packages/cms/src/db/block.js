const {BLOCK_TYPES} = require("../utils/consts/cms");

module.exports = function(sequelize, db) {

  const block = sequelize.define("block",
    {
      id: {
        type: db.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },

      /* block metadata */
      settings: {
        type: db.JSON,
        defaultValue: {}
      },
      type: {
        type: db.STRING,
        defaultValue: BLOCK_TYPES.PARAGRAPH
      },
      shared: {
        type: db.BOOLEAN,
        defaultValue: false
      },

      /* layout */
      blockrow: {
        type: db.INTEGER,
        defaultValue: 0
      },
      blockcol: {
        type: db.INTEGER,
        defaultValue: 0
      },

      /* generators & vizes */
      api: {
        type: db.TEXT,
        defaultValue: ""
      },
      logic: {
        type: db.TEXT,
        defaultValue: "return {}"
      },
      logicSimple: {
        type: db.JSON,
        defaultValue: null
      },
      logicSimpleEnabled: {
        type: db.BOOLEAN,
        defaultValue: true
      },

      /* relations */
      section_id: {
        type: db.INTEGER,
        onDelete: "cascade",
        references: {
          model: "canon_cms_section",
          key: "id"
        }
      }
    },
    {
      tableName: "canon_cms_block",
      freezeTableName: true,
      timestamps: false
    }
  );

  block.associate = models => {
    block.hasMany(models.block_content, {foreignKey: "id", sourceKey: "id", as: "contentByLocale"});
    block.belongsToMany(models.block, {through: "block_input", foreignKey: "block_id", otherKey: "input_id", as: "inputs"});
    block.belongsToMany(models.block, {through: "block_input", foreignKey: "input_id", otherKey: "block_id", as: "consumers"});
  };

  return block;

};
