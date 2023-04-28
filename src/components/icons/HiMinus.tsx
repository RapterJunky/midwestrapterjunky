import SvgIcon from "@/components/ui/FontAwesomeIcon";

const HiMinus: React.FC<{ className?: string }> = ({ className }) => (
  <SvgIcon
    className={className}
    ariaHidden
    clipRule="evenodd"
    fillRule="evenodd"
    prefix="hi"
    iconName="minus"
    icon={[20, 20, [], "", "M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"]}
  />
);

export default HiMinus;
