const ImageGralleryFragment = `
fragment IGFragment on ImageGalleryRecord {
    _modelApiKey
    heading
    displayHeading
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
