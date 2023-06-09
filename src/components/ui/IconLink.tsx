import Link from "next/link";

import FontAwesomeIcon from "@/components/ui/FontAwesomeIcon";
import type { LinkWithIcon } from "@type/page";

const IconLink: React.FC<LinkWithIcon & { className: string; dataCy?: string }> = (
  props
) => {
  if (props.useIcon && props.icon) {
    const dir = props.iconPosition === "start";
    return (
      <Link
        data-cy={props.dataCy}
        href={props.link}
        className={props.className}
      >
        {dir ? <FontAwesomeIcon {...props.icon} /> : null}
        {props.title}
        {!dir ? <FontAwesomeIcon {...props.icon} /> : null}
      </Link>
    );
  }

  return (
    <Link data-cy={props.dataCy} href={props.link} className={props.className}>
      {props.title}
    </Link>
  );
};

export default IconLink;
