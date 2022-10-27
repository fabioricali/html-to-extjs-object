import htm from 'htm'

function createComponentConfig(type, props, children) {
    //console.log(type, props, children)
    let componentConfig = {
        _originType: type,
        items: [],
        listeners: {},
        html: ''
    };

    for (let prop in props) {
        if (prop.startsWith('on')) {
            componentConfig.listeners[prop.substring(2)] = props[prop];
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
        return createComponentConfig(type.name, type(props), children)
    }
    return createComponentConfig(type, props, children)
}

const extml = htm.bind(h);
export default extml;

