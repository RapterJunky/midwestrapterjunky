const TASFragment = `
fragment TASFragment on TestimonialAndShareRecord {
    __typename
    buttonlink
    linkTitle
    description {
      blocks
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
