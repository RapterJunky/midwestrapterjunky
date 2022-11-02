export default `
fragment UEWIRFragment on UpcomingeventswithimageRecord {
    events {
      eventLink {
        dateFrom
        dateTo
        title
        id
      }
      bgImage {
        url
        alt
      }
    }
    _modelApiKey
  }
`;