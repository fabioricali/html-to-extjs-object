import htm from 'htm'
import {createStyle, destroyStyle} from './style.js';
import {createContext} from "./context.js";
import {isEvent, addEvent, extractListenerName, createEventObject} from './event.js';
import {generateHtmlClass} from "./generateHtmlClass.js";

export {generateHtmlClass};

export function initialize() {
    createStyle.apply(this);
    createContext.apply(this);
}

export function destroy() {
    destroyStyle.apply(this)
}

function createComponentConfig(type, props, children, propsFunction) {

    // default configuration
    let componentConfig = {
        xtype: type.toLowerCase(),
        listeners: [
            createEventObject('initialize', initialize),
            createEventObject('destroy', destroy)
        ]
    };

    let configFromProps = Object.assign({}, props, propsFunction);
    let isHtmlType = (configFromProps.xtype || type).startsWith('html-')

    if (isHtmlType) {
        componentConfig._propsAttributes = props;
    } else {
        for (let prop in configFromProps) {
            if (isEvent(prop) && !isHtmlType) {
                addEvent(
                    componentConfig,
                    createEventObject(extractListenerName(prop), configFromProps[prop])
                );
            } else if (prop === 'controller' && typeof configFromProps[prop] === 'function') {
                componentConfig[prop] = configFromProps[prop]();
            } else {
                componentConfig[prop] = configFromProps[prop];
            }
        }
    }

    children.forEach(child => {
        //console.log(child.xtype)
        if (typeof child === 'string') {
            if (!componentConfig.html)
                componentConfig.html = '';
            componentConfig.html += child;
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
            componentConfig.columns.push(child);
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
            componentConfig.items.push(child);
        }
    });

    return componentConfig
}

function detectClassType(xtype) {
    if (xtype.startsWith('ext-')) {
        xtype = xtype.split('ext-')[1];
    } else {
        xtype = 'html-' + xtype;
    }
    return xtype;
}

function _h(type, props, ...children) {
    if (type === 'style') {
        return {isStyle: true, content: children[0] || ''}
    } else if (type === 'context') {
        return {isContext: true, props, children: children[0]}
    } else if (typeof type === 'function') {
        return createComponentConfig(detectClassType(type.name), type(props), children, props)
    }
    return createComponentConfig(detectClassType(type), props, children);
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

try {
    if (window) {
        generateHtmlClass()
    }
} catch (e) {}