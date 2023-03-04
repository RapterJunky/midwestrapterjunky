const UEWIRFragment = `
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
        responsiveImage(imgixParams: {crop: focalpoint, w: 960, h: 960 }) {
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
}`;
export default UEWIRFragment;
