const useOnSelector = (selectors, router) => {
  const {query, replace} = router;
  return (name, value, isComparison) => {

    const newSelectors = {...selectors};
    newSelectors[`${isComparison ? "compare_" : ""}${name}`] = value;
    // updateQuery:
    const newQuery = {...query, ...newSelectors};
    // if (comparison) newQuery.compare = comparison.dims[0].memberSlug;
    // else delete newQuery.compare;
    replace({query: newQuery}, undefined, {shallow: true});

  };
};

export default useOnSelector;
