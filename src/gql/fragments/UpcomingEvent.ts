const UpcomingEventFragment = `
fragment UERFragment on UpcomingeventRecord {
    __typename
    event {
      title
      description {
        blocks {
          __typename
          content
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
