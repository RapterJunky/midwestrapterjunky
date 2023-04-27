import SvgIcon from "@components/FontAwesomeIcon";

const HiMenu: React.FC<{ className?: string }> = ({ className }) => <SvgIcon
    className={className}
    ariaHidden
    clipRule="evenodd"
    fillRule="evenodd"
    prefix="hi"
    iconName="menu"
    icon={[20, 20, [], "", "M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"]} />

export default HiMenu;