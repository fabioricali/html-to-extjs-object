import {addEvent, createEventObject, extractListenerName, isEvent} from "./event.js";
import {destroy, initialize} from "./defaultListeners.js";

const columnTypes = [
    'gridcolumn', 'column', 'templatecolumn', 'booleancolumn',
    'checkcolumn', 'datecolumn', 'numbercolumn', 'rownumberer',
    'textcolumn', 'treecolumn'
];

export function createComponentConfig(type, props, children, propsFunction) {
    // Default configuration
    let componentConfig = initializeComponentConfig(type);

    // Configuration based on props
    let configFromProps = Object.assign({}, props, propsFunction);

    if (isHtmlType(configFromProps.xtype || type)) {
        componentConfig._propsAttributes = props;
    } else {
        applyPropsToConfig(componentConfig, configFromProps);
    }

    // Configuration based on children
    configureChildren(componentConfig, children, type);

    return componentConfig;
}

function isHtmlType(type) {
    return (type).startsWith('html-')
}

// Function to initialize the base configuration
function initializeComponentConfig(type) {
    return {
        xtype: type.toLowerCase(),
        listeners: [
            createEventObject('initialize', initialize),
            createEventObject('destroy', destroy)
        ]
    };
}

// Function to apply props to componentConfig
function applyPropsToConfig(config, props) {
    for (let prop in props) {
        if (isEvent(prop)) {
            addEvent(
                config,
                createEventObject(extractListenerName(prop), props[prop])
            );
        } else if (prop === 'controller' && typeof props[prop] === 'function') {
            config[prop] = props[prop]();
        } else if (prop === 'ref' && props[prop] && props[prop].$$isRef) {
            config.listeners = config.listeners || [];
            config.listeners.push(createEventObject('initialize', (o) => {
                props[prop].value = o;
            }))
        } else if (prop === 'class') {
            config['cls'] = props[prop];
        } else if (Array.isArray(props[prop]) && props[prop].$$hasState) {
            let buildAttributeValue = () => props[prop].map(item => {
                if (typeof item === 'function' && item.$$isState) {
                    return item()
                } else {
                    return item
                }
            }).join('');

            config[prop] = buildAttributeValue();

            config.listeners = config.listeners || [];

            config.listeners.push(createEventObject('initialize', (o) => {
                o.$$attributesStateListeners = [];
                // per ogni state sottoscrivo un listener per ricostruire nuovamente il valore dell'attributo ad ogni cambiamento
                props[prop].forEach(item => {
                    if (typeof item === 'function' && item.$$isState) {
                        o.$$attributesStateListeners.push(item.$$subscribe(value => {
                            let setterName = createSetterName(prop);
                            if (typeof o[setterName] === 'function') {
                                o[createSetterName(prop)](buildAttributeValue())
                            }
                        }))
                    }
                })
            }))
            config.listeners.push(createEventObject('destroy', (o) => {
                if (o.$$attributesStateListeners) {
                    o.$$attributesStateListeners.forEach(listener => listener());
                }
            }))
        } else if (typeof props[prop] === 'function') {
            let propsProp = props[prop];
            if (propsProp.$$isState) {
                config.listeners = config.listeners || [];
                config.listeners.push(createEventObject('initialize', (o) => {
                    o.$$stateListener = propsProp.$$subscribe(value => {
                        let setterName = createSetterName(prop);
                        if (typeof o[setterName] === 'function') {
                            o[createSetterName(prop)](value)
                        }
                    })
                }))
                config.listeners.push(createEventObject('destroy', (o) => {
                    if (o.$$stateListener) {
                        o.$$stateListener()
                    }
                }))
                props[prop] = props[prop]();
            }
            config[prop] = props[prop];
        } else {
            config[prop] = props[prop];
        }
    }
}

// Function to configure componentConfig based on children
function configureChildren(config, children, type) {
    children.forEach(child => {
        if (typeof child === 'undefined') return;
        if (child.xtype && columnTypes.includes(child.xtype)) {
            addToArray(config, 'columns', child);
        } else if (child.xtype === 'menu' && type === 'button') {
            addSingle(config, 'menu', child);
        } else if (child.xtype === 'button' && columnTypes.includes(type)) {
            addSingle(config, 'cell', {
                xtype: 'widgetcell',
                forceWidth: true,
                widget: {
                    xtype: 'container',
                    items: []
                }
            });
            addToArray(config.cell.widget, 'items', child);
        } else if (child.xtype === 'button' && type === 'widgetcell') {
            // create widget child container
            addSingle(config, 'widget', {
                xtype: 'container',
                items: []
            });
            addToArray(config.widget, 'items', child);
        } else if (child.xtype === 'widgetcell') {
            addSingle(config, 'cell', child);
        } else if (child.xtype) {
            addToArray(config, 'items', child);
        } else {
            if (child.$$isState) {
                // create state component
                addToArray(config, 'items', {
                    xtype: 'html-x-state',
                    html: String(child()),
                    listeners: [
                        createEventObject('initialize', (o) => {
                            o.$$stateListener = child.$$subscribe(value => {
                                o.bodyElement.el.dom.innerHTML = String(value)
                            })
                        }),
                        createEventObject('destroy', (o) => {
                            if (o.$$stateListener) {
                                o.$$stateListener()
                            }
                        })
                    ]
                });
            } else {
                let processedValue = processValueForHtml(child)

                // if there is some state in the children array it's better to use the html-x-html
                if (isPlainText(processedValue) && children.some(
                    (item) => typeof item === 'function' && item.$$isState === true
                )) {
                    // create html text component
                    // console.log(processValueForHtml(child))
                    addToArray(config, 'items', {
                        xtype: 'html-x-html',
                        html: processedValue,
                        listeners: [
                            createEventObject('initialize', initialize),
                            createEventObject('destroy', destroy)
                        ]
                    });
                } else {
                    // console.log('html', child)
                    config.html = config.html || '';
                    config.html += processedValue;
                }
            }
        }
    });
}

function isPlainText(str) {
    const htmlTagPattern = /<[^>]*>/g;
    return !htmlTagPattern.test(str);
}

// Function to safely add an element to an array property
function addToArray(config, key, item) {
    if (!config[key]) {
        config[key] = [];
    }
    config[key].push(item);
}

// Function to add a single item to a property if it's not already present
function addSingle(config, key, item) {
    if (!config[key]) {
        config[key] = item;
    }
}

// Function to handle value types and convert them to strings for HTML content
function processValueForHtml(value) {
    const convertableTypes = ['string', 'number', 'boolean'];

    // Verifica se il valore è di un tipo convertibile direttamente
    if (convertableTypes.includes(typeof value)) {
        return String(value);
    }

    // Se è una funzione, eseguila e processa il risultato
    if (typeof value === 'function') {
        const result = value();
        return convertableTypes.includes(typeof result) ? String(result) : '';
    }

    // Warning per tipi non gestiti
    console.warn('Unhandled value type:', value);
    return ''; // Valore di default per tipi non supportati
}


function createSetterName(attribute) {
    return `set${attribute.charAt(0).toUpperCase()}${attribute.slice(1)}`;
}