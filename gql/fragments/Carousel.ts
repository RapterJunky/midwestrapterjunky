export default `
fragment CRFragment on CarouselRecord {
    images {
      blurUpThumb
      url
      customData
      alt
    }
    _modelApiKey
}
`;