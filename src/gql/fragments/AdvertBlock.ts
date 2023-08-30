const AdvertBlockFragment = `
fragment ABFragment on AdvertBlockRecord {
    __typename
    bgcolor {
      hex
    }
    headingleft
    headingright
    link
    textleft
    textright
}`;
export default AdvertBlockFragment;
