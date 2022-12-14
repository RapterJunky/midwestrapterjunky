export default `
fragment IGFragment on ImageGalleryRecord {
    _modelApiKey
    heading
    displayHeading
    images {
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
`;