import {useRouter} from "next/router";
import {useContext, useState, useEffect} from "react";

import axios from "axios";

import ProfileContext from "../components/ProfileContext";

/** */
export default function useComparison(slug) {
  const [comparison, setComparison] = useState(null);
  const [comparisonLoading, setComparisonLoading] = useState(false);
  const {query, locale} = useRouter();
  const compareSlug = query?.compare;

  useEffect(() => {
    if (compareSlug) {
      setComparisonLoading(true);
      const url = `${process.env.NEXT_PUBLIC_CMS}profile?slug=${slug}&id=${compareSlug}&locale=${locale}`;
      axios.get(url)
        .then(resp => {
          setComparison(resp.data);
          setComparisonLoading(false);
        })
        .catch(() => {
          alert("Error loading comparison");
          setComparisonLoading(false);
        });
    }
  }, [compareSlug, locale, slug]);

  return {compareSlug, comparison, comparisonLoading, setComparison};
}
