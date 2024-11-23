// import htm from "htm";
import htm from "./htm/index.js";
import {createComponentConfig} from "./createComponentConfig.js";
import {detectClassType} from "./detectClassType.js";
// import {isHtmlType} from "./isHtmlType.js";

// export function _h(type, props, ...children) {
//     if (type === 'style') {
//         //console.log(children)
//         return {isStyle: true, content: children}
//     } else if (type === 'context') {
//         return {isContext: true, props, children: children[0]}
//     } else if (typeof type === 'function') {
//         let resolvedFunction = type(props)
//         return createComponentConfig(resolvedFunction.xtype, type(props), children, props)
//     } else {
//         return createComponentConfig(detectClassType(type), props, children);
//     }
// }

export function _h(type, props, ...children) {
    if (type === 'style') {
        //console.log(children)
        return {isStyle: true, content: children}
    } else if (type === 'context') {
        return {isContext: true, props, children: children[0]}
    } else if (typeof type === 'function') {
        return createComponentConfig(detectClassType(type.name), type(props), children, props)
    }
    return createComponentConfig(detectClassType(type), props, children);
}

export function h(strings, ...values) {
    // console.log(strings, ...values)
    let parsed = htm.bind(_h)(strings, ...values);
    //get style by component definition
    if (parsed.length > 1 && parsed[0].isStyle) {
        let styleContent = parsed[0].content;
        parsed = parsed[1];
        parsed.stylesheet = styleContent;
    }

    //get context
    if (parsed.isContext) {
        parsed.props = parsed.props || {};
        let contextName = parsed.props.name;
        //get possible stylesheet obtained from the upper block
        let stylesheet = parsed.stylesheet;
        parsed = parsed.children;
        parsed.stylesheet = stylesheet;
        parsed.contextName = contextName;
        parsed.isContext = true;
    }
    return parsed
}