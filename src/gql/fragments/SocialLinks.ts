const SocialLinksFragment = `
fragment SLFragment on SocialLinksBlockRecord {
    _modelApiKey
    sociallinks {
      logo
      link
      iconColor {
        hex
      }
    }
}` as const;
export default SocialLinksFragment;