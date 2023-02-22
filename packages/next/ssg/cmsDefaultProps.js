import axios from "axios";

const getProfile = async (slugs, locale) => {
  const params = slugs
    .map((m, i) => `${i % 2 ? "id" : "slug"}${2 % (i + 1) ? "2" : ""}=${m}`);
  const profileUrl = new URL(`/api/profile/?${params.join("&")}&locale=${locale}`, process.env.NEXT_PUBLIC_CMS).href;
  const res = await axios.get(profileUrl)
    .then(resp => {
      const profileData = resp.data;

      /** Image Metadata
      * A profile is a set of one more slug/id pairs. In multi-variate profiles, these pairs are strictly
      * ordered, for example, /geo/mass/export/coal/import/cars. Each of these slug/id pairs may or may not
      * have image data associated with it, which makes up the backdrop of the Hero Section. If it does have
      * an image, then it also will have metadata. The `images` array that I create is a strictly ordered
      * array of image links and their data. This means, in the example above, if /export/coal is the only
      * one of the three that have an image, then this image array will be [null, {imageData}, null].
      */
      const {dims, images} = profileData;

      const newImages = [];
      if (dims) {
        // eslint-disable-next-line no-plusplus
        for (let i = 0; i < dims.length; i++) {
          if (images[i]) {
            newImages.push({
              src: new URL(
                `/api/image?slug=${dims[i].slug}&memberSlug=${dims[i].memberSlug}&size=splash`,
                process.env.NEXT_PUBLIC_CMS
              ).href,
              author: images[i].author ? images[i].author : null,
              meta: images[i].meta ? images[i].meta : null,
              permalink: images[i].url ? images[i].url : null
            });
          }
        }
      }
      profileData.images = newImages;

      return profileData;
    });

  return res;
};


export default async function cmsDefaultProps (slugs, locale) {
  const profile = await getProfile(slugs, locale);
  if (profile.error) return {notFound: true};
  const formatterURL = new URL("/api/formatters", process.env.NEXT_PUBLIC_CMS);
  const formatters = await axios.get(formatterURL.href)
    .then(resp => resp.data);

  return {
    profile,
    formatters
  };
}
