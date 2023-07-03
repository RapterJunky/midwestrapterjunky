const SocialLinksFragment = `
fragment SLFragment on SocialLinksBlockRecord {
    __typename
    sociallinks {
      logo
      link
      iconColor {
        hex
      }
    }
}` as const;
export default SocialLinksFragment;
