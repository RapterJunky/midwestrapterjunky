export default `
fragment IGFragment on ImageGalleryRecord {
    _modelApiKey
    heading
    images {
      url
      alt
    }
  }
`;