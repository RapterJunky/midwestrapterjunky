const getPlaceholderImage = (seed?: string) =>
  `https://api.dicebear.com/6.x/initials/png?seed=${encodeURIComponent(
    seed ?? "PH",
  )}`;
export default getPlaceholderImage;
