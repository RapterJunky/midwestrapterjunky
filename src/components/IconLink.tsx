import Link from "next/link";
import type { LinkWithIcon } from "@type/page";
import FontAwesomeIcon from "@components/FontAwesomeIcon";

const IconLink = (props: LinkWithIcon & { className: string, dataCy?: string; }) => {
  if (props.useIcon && props.icon) {
    const dir = props.iconPosition === "start";
    return (
      <Link data-cy={props.dataCy} href={props.link} className={props.className}>
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
