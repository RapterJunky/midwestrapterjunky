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
        responsiveImage {
          sizes
          alt
          src
          height
          width
        }
        blurUpThumb
      }
    }
    _modelApiKey
  }
`;