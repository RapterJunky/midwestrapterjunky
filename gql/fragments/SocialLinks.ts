export default `
fragment SLFragment on SocialLinksBlockRecord {
    _modelApiKey
    sociallinks {
      logo
      link
      iconColor {
        hex
      }
    }
}
`;