import ImageHelper from "./ImageHelper";

const ImageGralleryFragment = `
fragment IGFragment on ImageGalleryRecord {
    heading
    displayHeading
    __typename
    images ${ImageHelper("gallery")}
  }`;
export default ImageGralleryFragment;
