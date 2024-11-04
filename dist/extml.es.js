/* Extml, version: 2.2.2 - November 4, 2024 18:22:16 */
const STYLE_PREFIX = 'extml-style-';

function composeStyleInner(cssContent, tag) {
    if (typeof cssContent !== 'string')
        return;
    //cssContent = mapper.getAll(cssContent);
    let sanitizeTagForAnimation = tag.replace(/\w/g, '');

    cssContent = cssContent
        .replace(/<\/?style>/g, '')
        .replace(/{/g, '{\n')
        .replace(/}/g, '}\n')
        .replace(/^(\s+)?:(component)(\s+)?{/gm, tag + ' {')
        .replace(/:(component)/g, '')
        .replace(/(@(?:[\w-]+-)?keyframes\s+)([\w-_]+)/g, `$1 ${sanitizeTagForAnimation}-$2`)
        .replace(/((?:[\w-]+-)?animation(?:-name)?(?:\s+)?:(?:\s+))([\w-_]+)/g, `$1 ${sanitizeTagForAnimation}-$2`)
        // Remove comments
        .replace(/\/\*[\s\S]*?\*\/|([^:]|^)\/\/.*$/gm, '')
        .replace(/\S.*{/gm, match => {
            if (/^(@|:host|(from|to|\d+%)[^-_])/.test(match))
                return match;
            let part = match.split(',');
            const sameTag = new RegExp(`^${tag.replace(/[[\]]/g, '\\$&')}(\\s+)?{`);
            for (let i = 0; i < part.length; i++) {
                part[i] = part[i].trim();
                if (sameTag.test(part[i]))
                    continue;
                if (/^:global/.test(part[i]))
                    part[i] = part[i].replace(':global', '');
                else
                    part[i] = `${tag} ${part[i]}`;
            }
            match = part.join(',');
            return match;
        });
    cssContent = cssContent
        .replace(/\s{2,}/g, ' ')
        .replace(/{ /g, '{')
        .replace(/ }/g, '}')
        .replace(/\s:/g, ':') //remove space before pseudo classes
        .replace(/\n/g, '')
        .trim();
    return cssContent;
}

function createStyle() {
    if (!this.stylesheet) return;
    let id = this.getId();
    let styleElement = document.createElement('style');
    styleElement.id = STYLE_PREFIX + id;
    styleElement.innerHTML = composeStyleInner(this.stylesheet, '#' + id);
    document.head.appendChild(styleElement);
}

function destroyStyle() {
    if (!this.stylesheet) return;
    document.getElementById(STYLE_PREFIX + this.getId()).remove();
}function createContext() {
    Ext.getApplication().appContext = Ext.getApplication().appContext || {};
    this.appContext = Ext.getApplication().appContext;
    let controller = this.getController();
    //append context to controller

    let children = this.query ? this.query('*') : [];
    if (this.contextName) {
        if (this.appContext[this.contextName] !== undefined) {
            // throw new Error('A context with this name already exists: ' + this.contextName);
            console.error('A context with this name already exists: ' + this.contextName, 'itemId:', this.getItemId());
        }
        this.appContext[this.contextName] = /*this.context[this.contextName] ||*/ {};
        this.appContext[this.contextName][this.getItemId()] = this;
        children.forEach(item => {
            this.appContext[this.contextName][item.getItemId()] = item;
            item.appContext = this.appContext;
        });
    }

    //if (this.isContext) {
    if (!this.context) {
        this.context = {};
        this.context[this.getItemId()] = this;
        children.forEach(item => {
            this.context[item.getItemId()] = item;
            item.context = this.context;
        });
    }

    if (controller) {
        controller.appContext = this.appContext;
        controller.context = this.context;
        controller.props = controller.view.props;
    }
}

function destroyContext() {
    Ext.getApplication().appContext = Ext.getApplication().appContext || {};
    if (this.contextName) {
        delete Ext.getApplication().appContext[this.contextName];
    }
    let itemId = this.getItemId();
    if (Ext.getApplication().appContext[itemId]) {
        delete Ext.getApplication().appContext[itemId];
    }
}function initialize() {
    createStyle.apply(this);
    createContext.apply(this);
}

function destroy() {
    destroyStyle.apply(this);
    destroyContext.apply(this);
}const htmlTags = [
    "a", "abbr", "acronym", "address", "applet", "area", "article", "aside", "audio", "b", "base", "basefont", "bdi", "bdo", "bgsound", "big", "blink", "blockquote", "body", "br", "button", "canvas", "caption", "center", "cite", "code", "col", "colgroup", "command", "content", "data", "datalist", "dd", "del", "details", "dfn", "dialog", "dir", "div", "dl", "dt", "element", "em", "embed", "fieldset", "figcaption", "figure", "font", "footer", "form", "frame", "frameset", "h1", "h2", "h3", "h4", "h5", "h6", "head", "header", "hgroup", "hr", "html", "i", "iframe", "image", "img", "input", "ins", "isindex", "kbd", "keygen", "label", "legend", "li", "link", "listing", "main", "map", "mark", "marquee", "math", "menu", "menuitem", "meta", "meter", "multicol", "nav", "nextid", "nobr", "noembed", "noframes", "noscript", "object", "ol", "optgroup", "option", "output", "p", "param", "picture", "plaintext", "pre", "progress", "q", "rb", "rbc", "rp", "rt", "rtc", "ruby", "s", "samp", "script", "section", "select", "shadow", "slot", "small", "source", "spacer", "span", "strike", "strong", "style", "sub", "summary", "sup", "svg", "table", "tbody", "td", "template", "textarea", "tfoot", "th", "thead", "time", "title", "tr", "track", "tt", "u", "ul", "var", "video", "wbr", "xmp",
    //custom tag
    "x-signal", "x-html"
];function defineExtClass(tag) {
    let className = 'html-' + tag;
    window.__extHtmlClass[className] = window.Ext.define(className, {
        extend: 'Ext.Container',
        xtype: className,
        element: {
            tag,
            reference: 'element'
        },
        template: [
            {
                tag: 'ghost-tag',
                reference: 'bodyElement',
                cls: '',
                uiCls: ''
            }
        ],
        getInnerHtmlElement() {
            return this.getRenderTarget();
        },
        listeners: [
            {
                initialize(o) {
                    //hack
                    requestAnimationFrame(() => {
                        this.el.dom.className = '';
                        this.innerElement.dom.className = '';
                        if (this._propsAttributes) {
                            Object.keys(this._propsAttributes).forEach(attribute => {
                                if (typeof this._propsAttributes[attribute] === 'function' && this._propsAttributes[attribute].$$isState) {
                                    if (this._propsAttributes[attribute].$$isState) {
                                        this.el.dom.setAttribute(attribute, this._propsAttributes[attribute]());
                                        o.$$stateListener = this._propsAttributes[attribute].$$subscribe(value => {
                                            this.el.dom.setAttribute(attribute, this._propsAttributes[attribute]());
                                        });
                                    } else {
                                        this.el.dom.addEventListener(attribute.substring(2), this._propsAttributes[attribute]);
                                    }
                                } else {
                                    this.el.dom.setAttribute(attribute, this._propsAttributes[attribute]);
                                }
                            });
                        }
                    });

                    // Rimuovo i due div del monitor, nodi dovrebbero essere sempre 3, quindi vado a colpo sicuro,
                    // il primo è il bodyElement, quello che poi conterrà eventuali figli
                    let sizeMonitorsEl = this.el.dom.childNodes[1];
                    let paintMonitorEl = this.el.dom.childNodes[2];

                    if (sizeMonitorsEl)
                        sizeMonitorsEl.remove();
                    if (paintMonitorEl)
                        paintMonitorEl.remove();

                    // sposto gli elementi dal ghost-tag al parent
                    let newParent = this.el.dom;
                    let oldParent = this.innerElement.dom;

                    if (newParent && oldParent) {
                        function move() {
                            while (oldParent.childNodes.length > 0) {
                                newParent.appendChild(oldParent.childNodes[0]);
                            }
                        }

                        move();

                        this.innerElement.dom = this.el.dom;

                        // Rimuovo ghost-tag
                        oldParent.remove();
                    }
                }
            },
            {
                destroy(o) {
                    if(o.$$stateListener) {
                        o.$$stateListener();
                    }
                }
            }
        ]
    });
}

function generateHtmlClass () {
    if (!window.__extHtmlClass) {
        window.__extHtmlClass = {};
        htmlTags.forEach(tag => defineExtClass(tag));
    }
}var n=function(t,s,r,e){var u;s[0]=0;for(var h=1;h<s.length;h++){var p=s[h++],a=s[h]?(s[0]|=p?1:2,r[s[h++]]):s[++h];3===p?e[0]=a:4===p?e[1]=Object.assign(e[1]||{},a):5===p?(e[1]=e[1]||{})[s[++h]]=a:6===p?e[1][s[++h]]+=a+"":p?(u=t.apply(a,n(t,a,r,["",null])),e.push(u),a[0]?s[0]|=2:(s[h-2]=0,s[h]=u)):e.push(a);}return e},t=new Map;function htm(s){var r=t.get(this);return r||(r=new Map,t.set(this,r)),(r=n(this,r.get(s)||(r.set(s,r=function(n){for(var t,s,r=1,e="",u="",h=[0],p=function(n){1===r&&(n||(e=e.replace(/^\s*\n\s*|\s*\n\s*$/g,"")))?h.push(0,n,e):3===r&&(n||e)?(h.push(3,n,e),r=2):2===r&&"..."===e&&n?h.push(4,n,0):2===r&&e&&!n?h.push(5,0,!0,e):r>=5&&((e||!n&&5===r)&&(h.push(r,0,e,s),r=6),n&&(h.push(r,n,0,s),r=6)),e="";},a=0;a<n.length;a++){a&&(1===r&&p(),p(a));for(var l=0;l<n[a].length;l++)t=n[a][l],1===r?"<"===t?(p(),h=[h],r=3):e+=t:4===r?"--"===e&&">"===t?(r=1,e=""):e=t+e[0]:u?t===u?u="":e+=t:'"'===t||"'"===t?u=t:">"===t?(p(),r=1):r&&("="===t?(r=5,s=e,e=""):"/"===t&&(r<5||">"===n[a][l+1])?(p(),3===r&&(h=h[0]),r=h,(h=h[0]).push(2,0,r),r=0):" "===t||"\t"===t||"\n"===t||"\r"===t?(p(),r=2):e+=t),3===r&&"!--"===e&&(r=4,h=h[0]);}return p(),h}(s)),r),arguments,[])).length>1?r:r[0]}function isEvent(prop) {
    return prop.startsWith('on')
}

function extractListenerName(prop) {
    return prop.substring(2)
}

function createEventObject(name, handle) {
    let event = {};
    event[name] = handle;
    return event;
}

function addEvent(componentConfig, eventObject) {
    componentConfig.listeners.push(eventObject);
}const columnTypes = [
    'gridcolumn', 'column', 'templatecolumn', 'booleancolumn',
    'checkcolumn', 'datecolumn', 'numbercolumn', 'rownumberer',
    'textcolumn', 'treecolumn'
];

function createComponentConfig(type, props, children, propsFunction) {
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
        } else if (prop === 'class') {
            config['cls'] = props[prop];
        } else {
            if (typeof props[prop] === 'function') {
                let propsProp = props[prop];
                if (propsProp.$$isState) {
                    config.listeners = config.listeners || [];
                    config.listeners.push(createEventObject('initialize', (o) => {
                        o.$$stateListener = propsProp.$$subscribe(value => {
                            let setterName = createSetterName(prop);
                            if (typeof o[setterName] === 'function') {
                                o[createSetterName(prop)](value);
                            }
                        });
                    }));
                    config.listeners.push(createEventObject('destroy', (o) => {
                        if(o.$$stateListener) {
                            o.$$stateListener();
                        }
                    }));
                    props[prop] = props[prop]();
                }
            }
            config[prop] = props[prop];
        }
    }
}

// Function to configure componentConfig based on children
function configureChildren(config, children, type) {
    children.forEach(child => {
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
                // create signal component
                addToArray(config, 'items', {
                    xtype: 'html-x-signal',
                    html: String(child()),
                    listeners: [
                        createEventObject('initialize', (o) => {
                            o.$$stateListener = child.$$subscribe(value => {
                                o.bodyElement.el.dom.innerHTML = String(value);
                            });
                        }),
                        createEventObject('destroy', (o) => {
                            if(o.$$stateListener) {
                                o.$$stateListener();
                            }
                        })
                    ]
                });
            } else {
                let processedValue = processValueForHtml(child);

                if (isPlainText(processedValue)) {
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
    switch (typeof value) {
        case 'string':
        case 'number':
        case 'boolean':
            return String(value);
        case 'function':
            const result = value();
            return (typeof result === 'string' || typeof result === 'number' || typeof result === 'boolean')
                ? String(result)
                : '';
        default:
            console.warn('Unhandled value type:', value);
            return ''; // Returns an empty string for unsupported types
    }
}

function createSetterName(attribute) {
    return `set${attribute.charAt(0).toUpperCase()}${attribute.slice(1)}`;
}function detectClassType(xtype) {
    if (xtype.startsWith('ext-')) {
        xtype = xtype.split('ext-')[1];
    } else if (!xtype.startsWith('html-')) {
        xtype = 'html-' + xtype;
    }
    return xtype;
}function _h(type, props, ...children) {
    if (type === 'style') {
        return {isStyle: true, content: children[0] || ''}
    } else if (type === 'context') {
        return {isContext: true, props, children: children[0]}
    } else if (typeof type === 'function') {
        return createComponentConfig(detectClassType(type.name), type(props), children, props)
    }
    return createComponentConfig(detectClassType(type), props, children);
}

function h(strings, ...values) {
    //console.log(strings, ...values)
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
}function createState(initialValue) {
    let state = initialValue;
    const listeners = new Set();

    // Funzione getter che restituisce un oggetto con valore e tipo
    // const getState = () => ({
    //     value: state,
    //     $$isState: true,
    //     subscribe,
    // });
    // Funzione per iscriversi ai cambiamenti di stato
    const subscribe = (listener) => {
        listeners.add(listener);
        return () => listeners.delete(listener); // Ritorna una funzione per rimuovere l'observer
    };
    // Funzione getter che restituisce un oggetto con valore e tipo
    const getState = () => state;
    getState.$$isState = true; // Aggiunge la proprietà isState direttamente alla funzione
    getState.$$subscribe = subscribe;

    // Funzione setter
    const setState = (newValue) => {
        if (newValue !== state) {
            state = newValue;
            listeners.forEach((listener) => listener(state));
        }
    };

    return [getState, setState, subscribe]; // Ritorniamo anche subscribe
}try {
    if (window) {
        generateHtmlClass();
    }
} catch (e) {}export{createState,destroy,generateHtmlClass,h,initialize};