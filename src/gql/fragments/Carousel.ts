const CarouselFragment = `
fragment CRFragment on CarouselRecord {
    images {
      responsiveImage {
        sizes
        src
        alt
        height
        width
      }
      blurUpThumb
    }
    _modelApiKey
}`;
export default CarouselFragment;

/**
 * 
 * {
      responsiveImage {
        alt
        title
        src
        sizes
      }
      blurUpThumb
    }
 * 
*/
