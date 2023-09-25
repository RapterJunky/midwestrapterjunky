import ImageHelper from "./ImageHelper";

const ImageRecordFragment = `
fragment ImageRecordFragment on ImageRecord {
    __typename
    content ${ImageHelper("singleimage")}
}`;

export default ImageRecordFragment;
