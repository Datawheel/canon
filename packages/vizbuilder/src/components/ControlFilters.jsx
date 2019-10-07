import React from "react";
import {connect} from "react-redux";
import FilterControl from "./ControlFilterItem";
import {selectFilters} from "../selectors/queryRaw";
import {doFilterCreate, doFilterDelete, doFilterUpdate} from "../actions/query";
import {structFilter} from "../helpers/structs";

/**
 * @typedef OwnProps
 * @property {string} [className]
 * @property {{[unit: string]: (d: number) => string}} [formatters]
 * @property {{[unit: string]: number}} [multipliers]
 * @property {string} labelActionAdd
 * @property {string} labelActionApply
 * @property {string} labelActionDelete
 * @property {string} labelActionEdit
 * @property {string} labelActionReset
 * @property {string} labelTitle
 */

/**
 * @typedef StateProps
 * @property {FilterItem[]} filters
 */

/**
 * @typedef DispatchProps
 * @property {() => void} filterCreateHandler
 * @property {(filterItem: FilterItem) => void} filterDeleteHandler
 * @property {(filterItem: FilterItem) => void} filterUpdateHandler
 */

/** @type {React.FC<OwnProps&StateProps&DispatchProps>} */
const FiltersManager = function({
  className,
  filterCreateHandler,
  filterDeleteHandler,
  filters,
  filterUpdateHandler,
  formatters,
  labelActionAdd,
  labelActionApply,
  labelActionDelete,
  labelActionEdit,
  labelActionReset,
  labelTitle,
  multipliers
}) {
  return (
    <fieldset className={className}>
      <legend className="label">{labelTitle}</legend>
      <div className="filter-items">
        {filters.map(filter => (
          <FilterControl
            operator={filter.operator}
            formatter={formatters[filter.measure]}
            identifier={filter.key}
            inputtedValue={filter.inputtedValue}
            interpretedValue={filter.interpretedValue}
            key={filter.key}
            labelActionApply={labelActionApply}
            labelActionDelete={labelActionDelete}
            labelActionEdit={labelActionEdit}
            labelActionReset={labelActionReset}
            measure={filter.measure}
            multiplier={multipliers[filter.measure]}
            onDelete={filterDeleteHandler}
            onUpdate={filterUpdateHandler}
          />
        ))}
      </div>
      <button className="action-add" onClick={filterCreateHandler}>
        {labelActionAdd}
      </button>
    </fieldset>
  );
};

FiltersManager.defaultProps = {
  formatters: {},
  multipliers: {}
};

/** @type {import("react-redux").MapStateToProps<StateProps,OwnProps,GeneralState>} */
function mapState(state) {
  return {
    filters: selectFilters(state)
  };
}

/** @type {import("react-redux").MapDispatchToPropsFunction<DispatchProps,OwnProps>} */
function mapDispatch(dispatch) {
  return {
    filterCreateHandler() {
      dispatch(doFilterCreate(structFilter({})));
    },

    filterDeleteHandler(filterItem) {
      dispatch(doFilterDelete(filterItem));
      // dispatch(doRunQuery());
    },

    filterUpdateHandler(filterItem) {
      dispatch(doFilterUpdate(filterItem));
      // dispatch(doRunQuery());
    }
  };
}

export default connect(mapState, mapDispatch)(FiltersManager);
