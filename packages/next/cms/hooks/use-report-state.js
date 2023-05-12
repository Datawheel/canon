import {useRouter} from "next/router";
import {useEffect, useMemo, useState} from "react";
import prepareProfile from "../utils/prepareProfile";
import funcifyFormatterByLocale from "../utils/funcifyFormatterByLocale";
import useComparison from "./use-comparison";

const splitComparisonKeys = obj => {
  const split = {
    profile: {},
    comparison: {}
  };
  Object.keys(obj).forEach(k => {
    split[k.startsWith("compare_") ? "comparison" : "profile"][k.replace("compare_", "")] = obj[k];
  });
  return split;
};

/**
 *
 */
export default function useReportState(initialProfile, formatters) {

  const [profile, setProfile] = useState(initialProfile);
  const {query, locale} = useRouter();

  const formatterFunctions = useMemo(() => funcifyFormatterByLocale(formatters, locale), [formatters, locale]);

  const {compareSlug, comparisonLoading, comparison, setComparison} = useComparison(profile);

  useEffect(() => {
    // if length is 1, then we only have the member slug, render profile as comes from the server
    if (Object.keys(query).length <= 1) return;

    // else we have some selector state, run prepareProfile to sync state with query params
    const selectors = {...query};
    const split = splitComparisonKeys(selectors);

    setProfile(profile => {
      if (profile) {
        const variables = profile.variables;
        const newProfile = prepareProfile(variables._rawProfile, variables, formatterFunctions, locale, split.profile);
        return {...profile, ...newProfile};
      }
      return profile;
    });

    setComparison(comparison => {
      if (comparison) {
        const compVars = comparison.variables;
        const newComp = prepareProfile(compVars._rawProfile, compVars, formatterFunctions, locale, split.comparison);
        return {...comparison, ...newComp};
      }
      return comparison;
    });

  }, [query, formatterFunctions, locale, initialProfile, setComparison, setProfile]);

  return {profile, comparison, formatterFunctions, comparisonLoading, compareSlug, setProfile};
}
