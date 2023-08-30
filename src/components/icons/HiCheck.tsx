import SvgIcon from "@/components/ui/FontAwesomeIcon";

const HiCheck: React.FC<{ className?: string }> = ({ className }) => (
  <SvgIcon
    className={className}
    ariaHidden
    clipRule="evenodd"
    fillRule="evenodd"
    prefix="hi"
    iconName="check"
    icon={[
      20,
      20,
      [],
      "",
      "M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z",
    ]}
  />
);

export default HiCheck;
