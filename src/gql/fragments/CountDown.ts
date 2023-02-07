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
    _modelApiKey
}`;

export default CountdownFragment;
