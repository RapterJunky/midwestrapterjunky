const CarouselFragment = `
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
}`;
export default CarouselFragment;
