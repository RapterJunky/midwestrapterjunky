const SiteTagsFragment = `
fragment SiteFragment on Site {
    faviconMetaTags {
      attributes
      content
      tag
    }
}`;
export default SiteTagsFragment;
