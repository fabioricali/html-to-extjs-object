export function isEvent(prop) {
    return prop.startsWith('on')
}

export function extractListenerName(prop) {
    return prop.substring(2)
}

export function createEventObject(name, handle) {
    let event = {}
    event[name] = handle;
    return event;
}

export function addEvent(componentConfig, eventObject) {
    componentConfig.listeners.push(eventObject);
}