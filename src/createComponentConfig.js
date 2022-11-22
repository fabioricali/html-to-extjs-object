import {addEvent, createEventObject, extractListenerName, isEvent} from "./event.js";
import {destroy, initialize} from "./index.js";

export function createComponentConfig(type, props, children, propsFunction) {

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
            } else if (prop === 'class') {
                componentConfig['cls'] = configFromProps[prop];
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
        } else if (child.xtype && ['menu'].includes(child.xtype) && ['button'].includes(type)) {
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