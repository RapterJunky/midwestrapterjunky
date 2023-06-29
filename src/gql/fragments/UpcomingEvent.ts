const UpcomingEventFragment = `
fragment UERFragment on UpcomingeventRecord {
    event {
      title
      description {
        blocks {
          __typename
          content {
            responsiveImage {
              sizes
              src
              alt
              height
              width
            }
            blurUpThumb
          }
          id
        }
        links
        value
      }
    }
    textColor {
      hex
    }
    backgroundColor {
      hex
    }
    _modelApiKey
}`;
export default UpcomingEventFragment;
