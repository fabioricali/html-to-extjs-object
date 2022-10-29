import htm from 'htm'
import {createStyle, destroyStyle} from './style.js';
import {isEvent, addEvent, extractListenerName, createEventObject} from './event.js';

function createComponentConfig(type, props, children, propsFunction) {
    let componentConfig = {
        xtype: type.toLowerCase(),
        listeners: [
            createEventObject('initialize', createStyle),
            createEventObject('destroy', destroyStyle)
        ]
    };

    props = Object.assign({}, props, propsFunction);

    for (let prop in props) {
        if (isEvent(prop)) {
            addEvent(
                componentConfig,
                createEventObject(extractListenerName(prop), props[prop])
            )
        } else {
            componentConfig[prop] = props[prop];
        }
    }

    children.forEach(child => {
        if (typeof child === 'string') {
            if (!componentConfig.html)
                componentConfig.html = '';
            componentConfig.html += child
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
    return parsed
}