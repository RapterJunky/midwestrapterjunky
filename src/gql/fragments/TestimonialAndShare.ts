const TASFragment = `
fragment TASFragment on TestimonialAndShareRecord {
    _modelApiKey
    buttonlink
    linkTitle
    description {
      blocks
      links
      value
    }
    bgImage {
      responsiveImage {
        sizes
        alt
        src
        height
        width
      }
      blurUpThumb
    }
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