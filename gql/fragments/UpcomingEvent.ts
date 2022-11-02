export default `
fragment UERFragment on UpcomingeventRecord {
    event {
      description {
        blocks
        links
        value
      }
    }
    textColor {
      hex
    }
    backgroundColor {
      hex
    }
    _modelApiKey
}
`;