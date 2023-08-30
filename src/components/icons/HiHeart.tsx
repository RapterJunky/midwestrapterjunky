import SvgIcon from "@/components/ui/FontAwesomeIcon";

const HiHeart: React.FC<{ className?: string }> = ({ className }) => (
  <SvgIcon
    className={className}
    ariaHidden
    clipRule="evenodd"
    fillRule="evenodd"
    prefix="hi"
    iconName="heart"
    icon={[
      20,
      20,
      [],
      "",
      "M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z",
    ]}
  />
);

export default HiHeart;
