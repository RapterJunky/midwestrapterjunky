const ImageGralleryFragment = `
fragment IGFragment on ImageGalleryRecord {
    heading
    displayHeading
    __typename
    images
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
