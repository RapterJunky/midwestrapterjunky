import Link from "next/link";
// This imports alot of extra stuff that is not required
// see about using nextjs import resolution 
// https://nextjs.org/blog/next-13-1#import-resolution-for-smaller-bundles
import * as FAIcons from 'react-icons/fa';
import type { LinkWithIcon } from '@lib/types';

const IconLink = (props: LinkWithIcon & { className: string; }) => {
    if(props.useIcon && props.icon) {
        const dir = props.iconPosition === "start";
        const name = props.icon.iconName.replace(/(\b\w)/g, letter => letter.toUpperCase()).replace("-","");
        let Icon = (FAIcons as any)[`Fa${name}`] ?? FAIcons["FaQuestion"];

        return (
            <Link href={props.link} className={props.className}>
                {dir ? <Icon/> : null} {props.title} {!dir ? <Icon/> : null}
            </Link>
        );
    }
     
    return (
        <Link href={props.link} className={props.className}>
            {props.title}
        </Link>
    );
};

export default IconLink;