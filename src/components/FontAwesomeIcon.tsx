import type { Icon } from "types/page";

type FillRule = "nonzero" | "evenodd" | "inherit" | undefined;
interface Props extends Icon {
  style?: React.CSSProperties;
  fillRule?: FillRule;
  clipRule?: number | string;
}



/**
 * @see https://github.com/tomphill/datocms-plugin-fontawesome
 */
const FontAwesomeIcon = ({
  prefix,
  iconName,
  icon,
  style,
  fillRule,
  clipRule
}: React.PropsWithoutRef<Props>) => {
  return (
    <svg
      data-fa={`${prefix}-${iconName}`}
      height="1em"
      width="1em"
      style={style}
      stroke="currentColor"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${icon[0]} ${icon[1]}`}
    >
      <path fillRule={fillRule} clipRule={clipRule} d={icon[4]}></path>
    </svg>
  );
};

export default FontAwesomeIcon;
