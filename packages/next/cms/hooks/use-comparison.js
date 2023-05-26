import {useRouter} from "next/router";
import {useState, useEffect} from "react";
import formatProfileResponse from "../utils/formatProfileResponse";
import axios from "axios";


/** */
export default function useComparison(profile) {

  const [comparison, setComparison] = useState(null);
  const [comparisonLoading, setComparisonLoading] = useState(false);
  const [comparisonError, setComparisonError] = useState(false);
  const {query, locale} = useRouter();
  const compareSlug = query?.compare;

  const slug = profile.meta[0].slug;

  useEffect(() => {
    if (compareSlug) {
      setComparisonLoading(true);
      const url = new URL(`/api/profile?slug=${slug}&id=${compareSlug}&locale=${locale}`, `${process.env.NEXT_PUBLIC_CMS}`).href;
      axios.get(url)
        .then(resp => {
          // The profile API endpoint doesn't give a proper HTTP error
          if (resp.data.error) {
            setComparison(null);
            setComparisonError(true);
            setComparisonLoading(false);
            return;
          }
          else {
            const data = formatProfileResponse(resp);
            setComparison(data);
            setComparisonError(false);
            setComparisonLoading(false);
          }

        });
    }
    else {
      setComparison(null);
    }
  }, [compareSlug, locale, slug]);

  return {compareSlug, comparison, comparisonLoading, setComparison, comparisonError};
}
