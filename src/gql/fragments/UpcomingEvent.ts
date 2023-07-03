const UpcomingEventFragment = `
fragment UERFragment on UpcomingeventRecord {
    __typename
    event {
      title
      description {
        blocks {
          __typename
          content {
            responsiveImage {
              sizes
              alt
              src
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
}`;
export default UpcomingEventFragment;
