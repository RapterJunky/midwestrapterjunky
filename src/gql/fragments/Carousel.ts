import ImageHelper from "./ImageHelper";
const CarouselFragment = `
fragment CRFragment on CarouselRecord {
    images ${ImageHelper("carousel")}
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
