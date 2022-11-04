export default `
fragment VWLFragment on VideowithlinkRecord {
    _modelApiKey
    isYoutubeVideo
    videoLink
    content {
      blocks
      links
      value
    }
    color {
      hex
    }
  }
`;