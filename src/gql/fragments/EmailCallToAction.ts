const EmailCallToActionFragment = `
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
}`;
export default EmailCallToActionFragment;