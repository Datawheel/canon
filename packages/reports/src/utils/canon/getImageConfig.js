module.exports = (env = process.env) => ({
  splashWidth: Number(env.CANON_CONST_IMAGE_SPLASH_WIDTH) || 1400,
  thumbWidth: Number(env.CANON_CONST_IMAGE_THUMB_WIDTH) || 400,
  bucket: env.CANON_CONST_STORAGE_BUCKET,
  flickrKey: env.FLICKR_API_KEY 
});
