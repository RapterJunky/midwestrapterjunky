import SvgIcon from "@components/FontAwesomeIcon";

const HiOutlineChevronRight: React.FC<{ className?: string }> = ({
  className,
}) => (
  <SvgIcon
    className={className}
    ariaHidden
    strokeWidth="2"
    stroke="currentColor"
    clipRule="evenodd"
    fill="none"
    fillRule="evenodd"
    strokeLinecap="round"
    strokeLinejoin="round"
    prefix="hi"
    iconName="outlinechevronright"
    icon={[24, 24, [], "", "M9 5l7 7-7 7"]}
  />
);

export default HiOutlineChevronRight;
