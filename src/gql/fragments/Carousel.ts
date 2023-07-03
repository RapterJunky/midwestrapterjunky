const CarouselFragment = `
fragment CRFragment on CarouselRecord {
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
    __typename
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
