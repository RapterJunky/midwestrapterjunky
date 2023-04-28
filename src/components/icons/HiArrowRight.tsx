import SvgIcon from "@/components/ui/FontAwesomeIcon";

const HiArrowRight: React.FC<{ className?: string }> = ({ className }) => (
  <SvgIcon
    className={className}
    ariaHidden
    clipRule="evenodd"
    fillRule="evenodd"
    prefix="hi"
    iconName="arrowright"
    icon={[
      20,
      20,
      [],
      "",
      "M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z",
    ]}
  />
);

export default HiArrowRight;
