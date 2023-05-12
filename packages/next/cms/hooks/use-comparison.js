import {useRouter} from "next/router";
import {useState, useEffect} from "react";
import formatProfileResponse from "../utils/formatProfileResponse";
import axios from "axios";


/** */
export default function useComparison(profile) {

  const [comparison, setComparison] = useState(null);
  const [comparisonLoading, setComparisonLoading] = useState(false);
  const {query, locale} = useRouter();
  const compareSlug = query?.compare;

  const slug = profile.meta[0].slug;

  useEffect(() => {
    if (compareSlug) {
      setComparisonLoading(true);
      const url = `${process.env.NEXT_PUBLIC_CMS}profile?slug=${slug}&id=${compareSlug}&locale=${locale}`;
      axios.get(url)
        .then(formatProfileResponse)
        .then(data => {
          setComparison(data);
          setComparisonLoading(false);
        })
        .catch(() => {
          alert("Error loading comparison");
          setComparisonLoading(false);
        });
    }
    else {
      setComparison(null);
    }
  }, [compareSlug, locale, slug]);

  return {compareSlug, comparison, comparisonLoading, setComparison};
}
