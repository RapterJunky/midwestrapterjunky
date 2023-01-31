export const capitlize = (value: string) =>
  value.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
