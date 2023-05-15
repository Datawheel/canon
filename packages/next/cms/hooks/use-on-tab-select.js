const useOnTabSelect = (selectors, router) => {
  const onTabSelect = (id, index) => {
    const newSelectors = {...selectors};
    newSelectors[`tabsection-${id}`] = index;
    // updateQuery as callback don't work. TODO: refactor
    router.replace({query: newSelectors}, undefined, {shallow: true});
  };
  return onTabSelect;
};

export default useOnTabSelect;
