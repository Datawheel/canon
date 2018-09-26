import {uuid} from "d3plus-common";

import OPERATORS from "./operators";
import {isValidCut} from "./validation";

/**
 * Generates a list of queries to call, based in a combination of the members for current cut conditions.
 * @param {object} query A base Vizbuilder's query object
 * @param {Condition[]} conditions The list of conditions to use for combinations
 */
export function generateMetaQueries(query, conditions) {
  return conditions.reduce((output, condition) => {
    if (isValidCut(condition) && condition.values.length < 5) {
      const newQuery = condition.values.map(member =>
        generateAlternativeQuery(query, condition, member)
      );
      output.push(...newQuery);
    }
    return output;
  }, []);
}

/**
 * Generates a query based on a specific member from a condition.
 * @param {object} generalQuery A base Vizbuilder's query object
 * @param {Condition} condition A condition to use as base for the new query
 * @param {Member} member The member to refer as main topic of the query
 */
export function generateAlternativeQuery(generalQuery, condition, member) {
  const drilldown = condition.property;
  return {
    ...generalQuery,
    member,
    drilldown,
    conditions: [
      {
        hash: uuid(),
        operator: OPERATORS.EQUAL,
        property: drilldown,
        type: "cut",
        values: [member]
      }
    ],
    dimension: drilldown.hierarchy.dimension
  };
}
