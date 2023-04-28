import SvgIcon from "@/components/ui/FontAwesomeIcon";

const HiChevronRight: React.FC<{ className?: string }> = ({ className }) => (
  <SvgIcon
    className={className}
    ariaHidden
    clipRule="evenodd"
    fillRule="evenodd"
    prefix="hi"
    iconName="chevronright"
    icon={[
      20,
      20,
      [],
      "",
      "M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z",
    ]}
  />
);

export default HiChevronRight;
