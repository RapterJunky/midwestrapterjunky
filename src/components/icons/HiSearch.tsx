import SvgIcon from "@components/FontAwesomeIcon";

const HiSearch: React.FC<{ className?: string }> = ({ className }) => (
  <SvgIcon
    className={className}
    ariaHidden
    clipRule="evenodd"
    fillRule="evenodd"
    prefix="hi"
    iconName="search"
    icon={[
      20,
      20,
      [],
      "",
      "M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z",
    ]}
  />
);

export default HiSearch;
