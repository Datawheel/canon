module.exports = {
  register: (sequelize, table, model) => {
    const queryInterface = sequelize.getQueryInterface();
    queryInterface.createTable(table, model);
    queryInterface.describeTable(table)
      .then(tableDefinition => {
        const promises = [];
        for (const column in model) {
          if (!tableDefinition[column]) {
            promises.push(queryInterface.addColumn(table, column, model[column]));
          }
        }
        return Promise.all(promises);
      });
    return sequelize.define(table, model);
  }
};
