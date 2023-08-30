import SvgIcon from "@/components/ui/FontAwesomeIcon";

const HiUser: React.FC<{ className?: string }> = ({ className }) => (
  <SvgIcon
    className={className}
    ariaHidden
    clipRule="evenodd"
    fillRule="evenodd"
    prefix="hi"
    iconName="user"
    icon={[
      20,
      20,
      [],
      "",
      "M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z",
    ]}
  />
);

export default HiUser;
