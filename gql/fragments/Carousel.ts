export default `
fragment CRFragment on CarouselRecord {
    images {
      responsiveImage {
        alt
        src
        sizes
      }
      blurUpThumb
      customData
    }
    _modelApiKey
}
`;