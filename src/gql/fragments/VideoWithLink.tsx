const VWLFragment = `
fragment VWLFragment on VideowithlinkRecord {
    _modelApiKey
    isYoutubeVideo
    videoLink
    youtubeid
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
export default VWLFragment;
