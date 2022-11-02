export default `
fragment ECTAFragment on EmailCallToActionRecord {
    callToActionMessage {
      value
      links
      blocks
    }
    backgroundColor {
      hex
    }
    _modelApiKey
}
`;