export default `
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
      alt
      url
    }
    bgColor {
      hex
    }
    testimonials {
      qoute
      rating
      author
    }
  }
`;