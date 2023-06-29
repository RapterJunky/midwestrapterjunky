const UpcomingEventFragment = `
fragment UERFragment on UpcomingeventRecord {
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
    _modelApiKey
}`;
export default UpcomingEventFragment;
