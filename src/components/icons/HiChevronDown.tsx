import SvgIcon from "@components/FontAwesomeIcon";

const HiChevronDown: React.FC<{ className?: string }> = ({ className }) => (
  <SvgIcon
    className={className}
    ariaHidden
    clipRule="evenodd"
    fillRule="evenodd"
    prefix="hi"
    iconName="chevrondown"
    icon={[
      20,
      20,
      [],
      "",
      "M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z",
    ]}
  />
);

export default HiChevronDown;
