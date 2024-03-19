import ImageHelper from "./ImageHelper";

const UpcomingEventFragment = `
fragment UERFragment on UpcomingeventRecord {
    __typename
    event {
      title
      description {
        blocks {
          __typename
          content ${ImageHelper("upcomingevent")}
          id
        }
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
}`;
export default UpcomingEventFragment;
