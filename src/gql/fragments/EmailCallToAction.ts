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
    __typename
}`;
export default EmailCallToActionFragment;
