const CarouselFragment = `
fragment CRFragment on CarouselRecord {
    images {
      responsiveImage {
        alt
        title
        src
        sizes
      }
      blurUpThumb
    }
    _modelApiKey
}`;
export default CarouselFragment;
