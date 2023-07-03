const ImageGralleryFragment = `
fragment IGFragment on ImageGalleryRecord {
    heading
    displayHeading
    __typename
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
  }`;
export default ImageGralleryFragment;
/*
{
      responsiveImage {
        sizes
        alt
        src
        height
        width
      }
      blurUpThumb
    }

*/
