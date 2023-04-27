import SvgIcon from "@components/FontAwesomeIcon";

const HiAnnotation: React.FC<{ className?: string }> = ({ className }) => <SvgIcon
    className={className}
    ariaHidden
    clipRule="evenodd"
    fillRule="evenodd"
    prefix="hi"
    iconName="annotation"
    icon={[20, 20, [], "", "M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z"]} />

export default HiAnnotation;