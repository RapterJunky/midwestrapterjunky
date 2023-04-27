import SvgIcon from "@components/FontAwesomeIcon";

const HiLockClosed: React.FC<{ className?: string }> = ({ className }) => <SvgIcon
    className={className}
    ariaHidden
    clipRule="evenodd"
    fillRule="evenodd"
    prefix="hi"
    iconName="lockclosed"
    icon={[20, 20, [], "", "M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"]} />

export default HiLockClosed;