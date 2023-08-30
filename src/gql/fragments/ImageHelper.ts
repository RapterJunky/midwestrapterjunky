const ImageHelper = (value: string) =>
  process.env.USE_JSON_IMAGE?.includes(value)
    ? ""
    : `
{
  responsiveImage {
    sizes
    alt
    src
    height
    width
  }
  blurUpThumb
}`;

export default ImageHelper;
