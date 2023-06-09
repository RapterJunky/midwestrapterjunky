import type { Icon } from "types/page";

type FillRule = "nonzero" | "evenodd" | "inherit" | undefined;
interface Props extends Icon {
  style?: React.CSSProperties;
  fillRule?: FillRule;
  clipRule?: number | string;
  className?: string;
  ariaHidden?: boolean;
  fill?: string;
  stroke?: string;
  strokeWidth?: string;
  strokeLinecap?: "inherit" | "butt" | "round" | "square";
  strokeLinejoin?: "inherit" | "round" | "miter" | "bevel";
}

/**
 * @see https://github.com/tomphill/datocms-plugin-fontawesome
 */
const SvgIcon: React.FC<React.PropsWithoutRef<Props>> = ({
  prefix,
  iconName,
  icon,
  style,
  fillRule,
  clipRule,
  className,
  ariaHidden,
  stroke,
  strokeWidth,
  strokeLinecap,
  strokeLinejoin,
  fill = "currentColor",
}) => {
  return (
    <svg
      aria-hidden={ariaHidden}
      className={className}
      data-id={`${prefix}-${iconName}`}
      height="1em"
      width="1em"
      strokeOpacity={strokeWidth}
      style={style}
      stroke={stroke}
      fill={fill}
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${icon[0]} ${icon[1]}`}
    >
      <path
        strokeLinejoin={strokeLinejoin}
        strokeLinecap={strokeLinecap}
        fillRule={fillRule}
        clipRule={clipRule}
        d={icon[4]}
      ></path>
    </svg>
  );
};

export default SvgIcon;
