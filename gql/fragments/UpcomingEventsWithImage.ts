export default `
fragment UEWIRFragment on UpcomingeventswithimageRecord {
    events {
      linkTitle
      eventLink {
        dateFrom
        dateTo
        title
        id
        slug
      }
      bgImage {
        url
        alt
      }
    }
    _modelApiKey
  }
`;