const VWLFragment = `
fragment VWLFragment on VideowithlinkRecord {
    __typename
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
