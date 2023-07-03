const CountdownFragment = `
fragment CountdownFragment on CountdownRecord {
    id
    heading
    bgColor {
      hex
    }
    event {
      dateFrom
      slug
    }
    __typename
}`;

export default CountdownFragment;
