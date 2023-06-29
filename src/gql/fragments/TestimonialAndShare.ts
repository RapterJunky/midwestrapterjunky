const TASFragment = `
fragment TASFragment on TestimonialAndShareRecord {
    _modelApiKey
    buttonlink
    linkTitle
    description {
      blocks {
        responsiveImage {
          sizes
          src
          alt
          height
          width
        }
        blurUpThumb
      }
      links
      value
    }
    bgImage
    bgColor {
      hex
    }
    testimonials {
      qoute
      rating
      author
    }
  }`;
export default TASFragment;
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
