import htm from 'htm'
import {createStyle, destroyStyle} from './style.js';
import {createContext} from "./context.js";
import {isEvent, addEvent, extractListenerName, createEventObject} from './event.js';

export function initialize() {
    createStyle.apply(this);
    createContext.apply(this);
}

export function destroy() {
    destroyStyle.apply(this)
}

function createComponentConfig(type, props, children, propsFunction) {
    let componentConfig = {
        xtype: type.toLowerCase(),
        listeners: [
            createEventObject('initialize', initialize),
            createEventObject('destroy', destroy)
        ]
    };

    props = Object.assign({}, props, propsFunction);

    for (let prop in props) {
        if (isEvent(prop)) {
            addEvent(
                componentConfig,
                createEventObject(extractListenerName(prop), props[prop])
            )
        } else if (prop === 'controller' && typeof props[prop] === 'function') {
            componentConfig[prop] = props[prop]();
        } else {
            componentConfig[prop] = props[prop];
        }
    }

    children.forEach(child => {
        if (typeof child === 'string') {
            if (!componentConfig.html)
                componentConfig.html = '';
            componentConfig.html += child
        } else if (child.xtype && [
            'gridcolumn',
            'column',
            'templatecolumn',
            'booleancolumn',
            'checkcolumn',
            'datecolumn',
            'numbercolumn',
            'rownumberer',
            'textcolumn',
            'treecolumn'
        ].includes(child.xtype)) {
            if (!componentConfig.columns)
                componentConfig.columns = [];
            componentConfig.columns.push(child)
        } else if (child.xtype && [
            'menu'
        ].includes(child.xtype) && [
            'button'
        ].includes(type)) {
            if (!componentConfig.menu)
                componentConfig.menu = child;
        } else {
            if (!componentConfig.items)
                componentConfig.items = [];
            componentConfig.items.push(child)
        }
    })

    return componentConfig
}

function _h(type, props, ...children) {
    if (type === 'style') {
        return {isStyle: true, content: children[0] || ''}
    } else if (type === 'context') {
        return {isContext: true, props, children: children[0]}
    } else if (typeof type === 'function') {
        return createComponentConfig(type.name, type(props), children, props)
    }
    return createComponentConfig(type, props, children);
}

export function h(strings, ...values) {
    let parsed = htm.bind(_h)(strings, ...values);
    //get style by component definition
    if (parsed.length > 1 && parsed[0].isStyle) {
        let styleContent = parsed[0].content;
        parsed = parsed[1];
        parsed.stylesheet = styleContent;
    }

    if (parsed.isContext) {
        let contextName = parsed.props.name;
        parsed = parsed.children;
        parsed.contextName = contextName;
    }

    return parsed
}