import { renderNodeRule, renderMarkRule } from 'react-datocms';
import {isParagraph, isHeading } from 'datocms-structured-text-utils'

//https://github.com/datocms/react-datocms/blob/master/docs/structured-text.md
export const markRules = [
    renderMarkRule((a)=>a.startsWith("text-"),(props)=>{
        return props.adapter.renderNode("span", {
            key: props.key,
            className: props.mark,
            children: props.children
        });
    })
];


export const rules = [
    renderNodeRule(isHeading,({ adapter: { renderNode }, node, children, key  })=>{
        return renderNode(
            "heading",
            { key, className: node.style },
            children
        );
    }),
    renderNodeRule(isParagraph,(props)=>{
        return props.adapter.renderNode(
            "p",
            { key: props.key, className: props.node?.style },
            props.children
        );
    })
];