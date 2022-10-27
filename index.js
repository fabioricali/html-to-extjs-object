import htm from 'htm'

function isListener(prop) {
    return prop.startsWith('on')
}

function extractListenerName(prop) {
    return prop.substring(2)
}

function createComponentConfig(type, props, children, propsFunction) {
    let componentConfig = {
        xtype: type.toLowerCase(),
        items: [],
        listeners: [],
        html: ''
    };

    props = Object.assign({}, props, propsFunction);

    for (let prop in props) {
        if (isListener(prop)) {
            let event = {}
            event[extractListenerName(prop)] = props[prop];
            componentConfig.listeners.push(event);
        } else {
            componentConfig[prop] = props[prop];
        }
    }

    children.forEach(child => {
        if (typeof child === 'string') {
            console.log(type, child)
            componentConfig.html += child
        } else {
            componentConfig.items.push(child)
        }
    })

    //console.log(componentConfig)
    return componentConfig
}

function h(type, props, ...children) {
    if (typeof type === 'function') {
        return createComponentConfig(type.name, type(props), children, props)
    }
    return createComponentConfig(type, props, children)
}

const extml = htm.bind(h);
export default extml;