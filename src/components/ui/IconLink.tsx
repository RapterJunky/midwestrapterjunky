import Link from "next/link";

import { buttonVariants } from "./button";
import FontAwesomeIcon from "@/components/ui/FontAwesomeIcon";
import type { LinkWithIcon } from "@type/page";
import { cn } from "@/lib/utils";

const IconLink: React.FC<
  LinkWithIcon & { className: string; dataCy?: string }
> = ({ useIcon, icon, iconPosition, className, link, dataCy, title }) => {
  if (useIcon && icon) {
    const dir = iconPosition === "start";
    return (
      <Link
        data-cy={dataCy}
        href={link}
        className={cn(buttonVariants({ variant: "link", size: "sm", className }))}
      >
        {dir ? <FontAwesomeIcon className="mr-1" {...icon} /> : null}
        {title}
        {!dir ? <FontAwesomeIcon {...icon} /> : null}
      </Link>
    );
  }

  return (
    <Link data-cy={dataCy} href={link} className={cn(buttonVariants({ variant: "link", size: "sm", className }))}>
      {title}
    </Link>
  );
};

export default IconLink;
