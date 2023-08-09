import axios from "axios";
import formatProfileResponse from "../cms/utils/formatProfileResponse";

const getProfile = async (slugs, locale) => {
  const params = slugs
    .map((m, i) => `${i % 2 ? "id" : "slug"}${2 % (i + 1) ? "2" : ""}=${m}`);
  const profileUrl = new URL(`/api/profile/?${params.join("&")}&locale=${locale}`, process.env.NEXT_PUBLIC_CMS).href;
  const res = await axios.get(profileUrl)
    .then(formatProfileResponse);
  return res;
};

/** */
export default async function cmsDefaultProps(slugs, locale) {
  const profile = await getProfile(slugs, locale);
  if (profile.error && profile.errorCode === 301) {
    // redirect to slug.
    const redirects = profile.canonRedirect;
    if (redirects) {
      // route structure.
      const route = ["slug1", "id1", "slug2", "id2"];
      const path = route.map((d) => redirects[d] || "").filter((d) => d.length);
      // Pass a ?redirect flag, to avoid a redirect loop
      // return res.redirect(301, `${route}?redirect=true`);
      return {redirect: `/${path.join("/")}/?redirect=true`};
    }
  }
  if (profile.error) return {notFound: true};
  const formatterURL = new URL("/api/formatters", process.env.NEXT_PUBLIC_CMS);
  const formatters = await axios.get(formatterURL.href)
    .then((resp) => resp.data);

  return {
    profile,
    formatters,
  };
}
