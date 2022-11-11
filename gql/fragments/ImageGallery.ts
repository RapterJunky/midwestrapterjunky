export default `
fragment IGFragment on ImageGalleryRecord {
    _modelApiKey
    heading
    displayHeading
    images {
      url
      alt
      height
      width
      responsiveImage {
        sizes
      }
      blurUpThumb
    }
  }
`;