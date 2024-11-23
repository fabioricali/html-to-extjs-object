/* Extml, version: 2.18.0 - November 23, 2024 16:15:55 */
(function(g,f){typeof exports==='object'&&typeof module!=='undefined'?f(exports):typeof define==='function'&&define.amd?define(['exports'],f):(g=typeof globalThis!=='undefined'?globalThis:g||self,f(g.extml={}));})(this,(function(exports){'use strict';const STYLE_PREFIX = 'extml-style-';

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

    this.stylesheetStateListeners = [];
    let stylesheet = '';
    if (this.stylesheet.some(
        (item) => typeof item === 'function' && item.$$isState === true
    )) {
        let stateItems = [];
        let buildStyle = () => this.stylesheet.map(item => {
            if (typeof item === 'function' && item.$$isState) {
                stateItems.push(item);
                return item()
            } else {
                return item
            }
        }).join('');

        stylesheet = buildStyle();

        stateItems.forEach(item => {
            this.stylesheetStateListeners.push(item.$$subscribe(value => {
                styleElement.innerHTML = composeStyleInner(buildStyle(), '#' + id);
            }));
        });
    } else {
        stylesheet = this.stylesheet.join('');
    }

    styleElement.innerHTML = composeStyleInner(stylesheet, '#' + id);
    document.head.appendChild(styleElement);
}

function destroyStyle() {
    if (!this.stylesheet) return;
    if (this.stylesheetStateListeners) {
        this.stylesheetStateListeners.forEach(listener => listener());
    }
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
    "x-s", "x-h", "x-f"
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
        __initializeHackAttempts: 0,
        __initializeHack(o) {
            {
                if (this.__initializeHackAttempts > 2) {
                    // console.warn('this.el.dom not found', this)
                    return;
                }
                if (!this.el || !this.el.dom ) {
                    this.__initializeHackAttempts++;
                    requestAnimationFrame(() => this.__initializeHack(o));
                    return
                }

                this.el.dom.className = '';
                this.innerElement.dom.className = '';
                if (this._propsAttributes) {
                    Object.keys(this._propsAttributes).forEach(attribute => {
                        if (attribute === 'ref' && this._propsAttributes[attribute].$$isRef) {
                            this._propsAttributes[attribute](o.el.dom);
                        } else if (this._propsAttributes[attribute].$$isState) {
                            this.el.dom.setAttribute(attribute, String(this._propsAttributes[attribute]()));
                            o.$$stateListener = this._propsAttributes[attribute].$$subscribe(value => {
                                this.el.dom.setAttribute(attribute, String(value));
                            });
                        } else if (attribute.startsWith('on') && typeof this._propsAttributes[attribute] === 'function') {
                            this.el.dom.addEventListener(attribute.substring(2), this._propsAttributes[attribute]);
                        } else {
                            if (Array.isArray(this._propsAttributes[attribute]) && this._propsAttributes[attribute].$$hasState) {
                                //console.log(this._propsAttributes[attribute])
                                // mi serve a costruire il valore dell'attributo concatenando i risultati degli state con le eventuali stringhe presenti
                                let buildAttributeValue = () => this.el.dom.setAttribute(attribute, this._propsAttributes[attribute].map(item => {
                                    if (typeof item === 'function' && item.$$isState) {
                                        return item()
                                    } else {
                                        return item
                                    }
                                }).join(''));

                                buildAttributeValue();

                                o.$$attributesStateListeners = [];
                                // per ogni state sottoscrivo un listener per ricostruire nuovamente il valore dell'attributo ad ogni cambiamento
                                this._propsAttributes[attribute].forEach(item => {
                                    if (typeof item === 'function' && item.$$isState) {
                                        o.$$attributesStateListeners.push(item.$$subscribe(value => {
                                            buildAttributeValue();
                                        }));
                                    }
                                });

                            } else {
                                this.el.dom.setAttribute(attribute, String(this._propsAttributes[attribute]));
                            }
                        }
                    });
                }
            }
        },
        listeners: [
            {
                initialize(o) {
                    //hack
                    requestAnimationFrame(() => this.__initializeHack(o));

                    this.el.dom.removeAttribute('class');
                    // l'id mi serve per lo style
                    if (!this.stylesheet)
                        this.el.dom.removeAttribute('id');
                    this.el.dom.removeAttribute('data-componentid');
                    this.el.dom.removeAttribute('data-xid');
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

                    if (o.$$attributesStateListeners) {
                        o.$$attributesStateListeners.forEach(listener => listener());
                    }
                }
            }
        ]
    });
}

function generateHtmlClass() {
    if (!window.__extHtmlClass) {
        window.__extHtmlClass = {};
        htmlTags.forEach(tag => defineExtClass(tag));
    }
}const MODE_SLASH = 0;
const MODE_TEXT = 1;
const MODE_WHITESPACE = 2;
const MODE_TAGNAME = 3;
const MODE_COMMENT = 4;
const MODE_PROP_SET = 5;
const MODE_PROP_APPEND = 6;

const CHILD_APPEND = 0;
const CHILD_RECURSE = 2;
const TAG_SET = 3;
const PROPS_ASSIGN = 4;
const PROP_SET = MODE_PROP_SET;
const PROP_APPEND = MODE_PROP_APPEND;

const evaluate = (h, built, fields, args) => {
	let tmp;

	// `build()` used the first element of the operation list as
	// temporary workspace. Now that `build()` is done we can use
	// that space to track whether the current element is "dynamic"
	// (i.e. it or any of its descendants depend on dynamic values).
	built[0] = 0;

	for (let i = 1; i < built.length; i++) {
		const type = built[i++];

		// Set `built[0]`'s appropriate bits if this element depends on a dynamic value.
		const value = built[i] ? ((built[0] |= type ? 1 : 2), fields[built[i++]]) : built[++i];

		if (type === TAG_SET) {
			args[0] = value;
		}
		else if (type === PROPS_ASSIGN) {
			args[1] = Object.assign(args[1] || {}, value);
		}
		else if (type === PROP_SET) {
			(args[1] = args[1] || {})[built[++i]] = value;
		}
		else if (type === PROP_APPEND) {
			++i;
			// support for array of prop
			if (typeof value === "function" && value.$$isState) {
				if (!Array.isArray(args[1][built[i]])) {
					args[1][built[i]] = [args[1][built[i]]];
					args[1][built[i]].$$hasState = true;
				}
			}

			if (Array.isArray(args[1][built[i]])) {
				args[1][built[i]].push(value);
			} else {
				args[1][built[i]] += (value + '');
			}
		}
		else if (type) { // type === CHILD_RECURSE
			// Set the operation list (including the staticness bits) as
			// `this` for the `h` call.
			tmp = h.apply(value, evaluate(h, value, fields, ['', null]));
			args.push(tmp);

			if (value[0]) {
				// Set the 2nd lowest bit it the child element is dynamic.
				built[0] |= 2;
			}
			else {
				// Rewrite the operation list in-place if the child element is static.
				// The currently evaluated piece `CHILD_RECURSE, 0, [...]` becomes
				// `CHILD_APPEND, 0, tmp`.
				// Essentially the operation list gets optimized for potential future
				// re-evaluations.
				built[i-2] = CHILD_APPEND;
				built[i] = tmp;
			}
		}
		else { // type === CHILD_APPEND
			args.push(value);
		}
	}

	return args;
};

const build = function(statics) {

	let mode = MODE_TEXT;
	let buffer = '';
	let quote = '';
	let current = [0];
	let char, propName;

	const commit = field => {
		if (mode === MODE_TEXT && (field || (buffer = buffer.replace(/^\s*\n\s*|\s*\n\s*$/g,'')))) {
			{
				current.push(CHILD_APPEND, field, buffer);
			}
		}
		else if (mode === MODE_TAGNAME && (field || buffer)) {
			{
				current.push(TAG_SET, field, buffer);
			}
			mode = MODE_WHITESPACE;
		}
		else if (mode === MODE_WHITESPACE && buffer === '...' && field) {
			{
				current.push(PROPS_ASSIGN, field, 0);
			}
		}
		else if (mode === MODE_WHITESPACE && buffer && !field) {
			{
				current.push(PROP_SET, 0, true, buffer);
			}
		}
		else if (mode >= MODE_PROP_SET) {
			{
				if (buffer || (!field && mode === MODE_PROP_SET)) {
					current.push(mode, 0, buffer, propName);
					mode = MODE_PROP_APPEND;
				}
				if (field) {
					current.push(mode, field, 0, propName);
					mode = MODE_PROP_APPEND;
				}
			}
		}

		buffer = '';
	};

	for (let i=0; i<statics.length; i++) {
		if (i) {
			if (mode === MODE_TEXT) {
				commit();
			}
			commit(i);
		}

		for (let j=0; j<statics[i].length;j++) {
			char = statics[i][j];

			if (mode === MODE_TEXT) {
				if (char === '<') {
					// commit buffer
					commit();
					{
						current = [current];
					}
					mode = MODE_TAGNAME;
				}
				else {
					buffer += char;
				}
			}
			else if (mode === MODE_COMMENT) {
				// Ignore everything until the last three characters are '-', '-' and '>'
				if (buffer === '--' && char === '>') {
					mode = MODE_TEXT;
					buffer = '';
				}
				else {
					buffer = char + buffer[0];
				}
			}
			else if (quote) {
				if (char === quote) {
					quote = '';
				}
				else {
					buffer += char;
				}
			}
			else if (char === '"' || char === "'") {
				quote = char;
			}
			else if (char === '>') {
				commit();
				mode = MODE_TEXT;
			}
			else if (!mode) ;
			else if (char === '=') {
				mode = MODE_PROP_SET;
				propName = buffer;
				buffer = '';
			}
			else if (char === '/' && (mode < MODE_PROP_SET || statics[i][j+1] === '>')) {
				commit();
				if (mode === MODE_TAGNAME) {
					current = current[0];
				}
				mode = current;
				{
					(current = current[0]).push(CHILD_RECURSE, 0, mode);
				}
				mode = MODE_SLASH;
			}
			else if (char === ' ' || char === '\t' || char === '\n' || char === '\r') {
				// <a disabled>
				commit();
				mode = MODE_WHITESPACE;
			}
			else {
				buffer += char;
			}

			if (mode === MODE_TAGNAME && buffer === '!--') {
				mode = MODE_COMMENT;
				current = current[0];
			}
		}
	}
	commit();
	return current;
};/**
 * Copyright 2018 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const CACHES = new Map();

const regular = function(statics) {
	let tmp = CACHES.get(this);
	if (!tmp) {
		tmp = new Map();
		CACHES.set(this, tmp);
	}
	tmp = evaluate(this, tmp.get(statics) || (tmp.set(statics, tmp = build(statics)), tmp), arguments, []);
	return tmp.length > 1 ? tmp : tmp[0];
};

var htm = regular;function isEvent(prop) {
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
}function isHtmlType(type) {
    return (type).startsWith('html-')
}const columnTypes = [
    'gridcolumn', 'column', 'templatecolumn', 'booleancolumn',
    'checkcolumn', 'datecolumn', 'numbercolumn', 'rownumberer',
    'textcolumn', 'treecolumn'
];

function createComponentConfig(type, props, children, propsFunction, isResolvedFunction) {
    // Default configuration
    let componentConfig = initializeComponentConfig(type);

    // Configuration based on props
    let configFromProps = Object.assign({}, props, propsFunction);

    if (isHtmlType(configFromProps.xtype || type)) {
        componentConfig._propsAttributes = props;
    }

    applyPropsToConfig(componentConfig, configFromProps);
    // Configuration based on children
    configureChildren(componentConfig, children, type);

    return componentConfig;
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
                props[prop](o);
            }));
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
                                o[createSetterName(prop)](buildAttributeValue());
                            }
                        }));
                    }
                });
            }));
            config.listeners.push(createEventObject('destroy', (o) => {
                if (o.$$attributesStateListeners) {
                    o.$$attributesStateListeners.forEach(listener => listener());
                }
            }));
        } else if (typeof props[prop] === 'function') {
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
                    if (o.$$stateListener) {
                        o.$$stateListener();
                    }
                }));
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
                    xtype: 'html-x-s',
                    html: String(child()),
                    listeners: [
                        createEventObject('initialize', (o) => {
                            o.$$stateListener = child.$$subscribe(value => {
                                o.bodyElement.el.dom.innerHTML = String(value);
                            });
                        }),
                        createEventObject('destroy', (o) => {
                            if (o.$$stateListener) {
                                o.$$stateListener();
                            }
                        })
                    ]
                });
            } else {
                let processedValue = processValueForHtml(child);
                // console.log(children.length, processedValue, isPlainText(processedValue), children.some(
                //     (item) => typeof item === 'function' && item.$$isState === true
                // ))
                // console.log(children)
                // if there is some state in the children array it's better to use the html-x-html
                if (isPlainText(processedValue) && (children.length > 1 || children.some(
                    (item) => typeof item === 'function' && item.$$isState === true
                ))) {
                    // create html text component
                    // console.log(processValueForHtml(child))
                    addToArray(config, 'items', {
                        xtype: 'html-x-h',
                        html: processedValue,
                        listeners: [
                            createEventObject('initialize', initialize),
                            createEventObject('destroy', destroy)
                        ]
                    });
                } else {
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
}function detectClassType(xtype) {
    if (xtype.startsWith('ext-')) {
        xtype = xtype.split('ext-')[1];
    } else if (!xtype.startsWith('html-')) {
        xtype = 'html-' + xtype;
    }
    return xtype;
}// import htm from "htm";

function _h(type, props, ...children) {
    if (type === 'style') {
        //console.log(children)
        return {isStyle: true, content: children}
    } else if (type === 'context') {
        return {isContext: true, props, children: children[0]}
    } else if (typeof type === 'function') {
        let resolvedFunction = type(props);

        // if (!isHtmlType(resolvedFunction.xtype)) {
        return createComponentConfig(resolvedFunction.xtype, type(props), children, props)
        // }

        // if (resolvedFunction.html) {
        //     children.push(resolvedFunction.html)
        // } else if (resolvedFunction.items) {
        //     children = children.concat(resolvedFunction.items)
        // }
        //
        // return createComponentConfig(resolvedFunction.xtype, resolvedFunction, children, props, true)
    }
    return createComponentConfig(detectClassType(type), props, children);
}

function h(strings, ...values) {
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
}const stateCache = new WeakMap(); // Cache globale per stati persistenti

function createState(initialValue, context = null, treatAsSingleEntity = false) {
    // Helper per gestire la persistenza opzionale
    const getPersistentState = (context, valueInitializer) => {
        if (!stateCache.has(context)) {
            stateCache.set(context, valueInitializer());
        }
        return stateCache.get(context);
    };

    // Gestione della persistenza
    if (context) {
        return getPersistentState(context, () => {
            return createState(initialValue, null, treatAsSingleEntity);
        });
    }

    // Logica standard per creare lo stato
    let isObject = typeof initialValue === 'object' && initialValue !== null && !Array.isArray(initialValue) && !(initialValue instanceof Date) && !treatAsSingleEntity;
    let state = isObject ? { ...initialValue } : initialValue;
    const globalListeners = new Set();
    const propertyListeners = isObject
        ? Object.fromEntries(Object.keys(state).map(key => [key, new Set()]))
        : null;

    const subscribe = (listener) => {
        globalListeners.add(listener);
        return () => globalListeners.delete(listener);
    };

    const getState = () => state;
    getState.$$isState = true;
    getState.$$subscribe = subscribe;

    const setState = (newValue) => {
        if (typeof newValue === "function") {
            newValue = newValue(state);
        }
        if (Array.isArray(initialValue)) {
            if (!arraysEqual(state, newValue)) {
                state = [...newValue];
                globalListeners.forEach(listener => listener(state));
            }
        } else if (initialValue instanceof Date) {
            if (state.getTime() !== newValue.getTime()) {
                state = new Date(newValue);
                globalListeners.forEach(listener => listener(state));
            }
        } else if (isObject) {
            let hasChanges = false;
            const newState = { ...state };

            Object.keys(newValue).forEach(key => {
                if (newValue[key] !== state[key]) {
                    newState[key] = newValue[key];
                    hasChanges = true;
                    propertyListeners[key].forEach(listener => listener(newState[key]));
                }
            });

            if (hasChanges) {
                state = newState;
                globalListeners.forEach(listener => listener(state));
            }
        } else {
            if (newValue !== state) {
                state = newValue;
                globalListeners.forEach(listener => listener(state));
            }
        }
    };

    // Creazione di setter specifici per ogni proprietà
    if (isObject) {
        Object.keys(state).forEach(key => {
            setState[key] = (newValue) => {
                if (state[key] !== newValue) {
                    state = { ...state, [key]: newValue };
                    propertyListeners[key].forEach(listener => listener(state[key]));
                    globalListeners.forEach(listener => listener(state));
                }
            };
        });
    }

    const arraysEqual = (a, b) => Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((val, index) => val === b[index]);

    const stateGetters = isObject
        ? Object.fromEntries(
            Object.keys(state).map(key => {
                const propertyGetter = () => state[key];
                propertyGetter.$$isState = true;
                propertyGetter.$$subscribe = listener => {
                    propertyListeners[key].add(listener);
                    return () => propertyListeners[key].delete(listener);
                };
                return [key, propertyGetter];
            })
        )
        : getState;

    return [isObject ? stateGetters : getState, setState, subscribe];
}

// export function createState(initialValue) {
//     let state = initialValue;
//     const listeners = new Set();
//
//     // Funzione per iscriversi ai cambiamenti di stato
//     const subscribe = (listener) => {
//         listeners.add(listener);
//         return () => listeners.delete(listener); // Ritorna una funzione per rimuovere l'observer
//     };
//     // Funzione getter che restituisce un oggetto con valore e tipo
//     const getState = () => state;
//     getState.$$isState = true; // Aggiunge la proprietà isState direttamente alla funzione
//     getState.$$subscribe = subscribe;
//
//     // Funzione setter
//     const setState = (newValue) => {
//         if (newValue !== state) {
//             state = newValue;
//             listeners.forEach((listener) => listener(state));
//         }
//     };
//
//     return [getState, setState, subscribe]; // Ritorniamo anche subscribe
// }
function createRef(onChange) {
    let _current = null;
    const subscribers = [];

    const ref = function(value) {
        if (arguments.length === 0) {
            // Getter
            return _current;
        } else {
            // Setter
            if (_current !== value) {
                _current = value;
                if (typeof onChange === "function") {
                    onChange(value);
                }
                // Notifica tutti i subscriber del cambiamento
                subscribers.forEach(callback => callback(value));
            }
        }
    };

    // Proprietà speciale per identificare l'oggetto come ref
    ref.$$isRef = true;

    // Metodo per aggiungere subscriber
    ref.$$subscribe = function(listener) {
        if (typeof listener === "function") {
            subscribers.push(listener);
            return () => {
                // Restituisci una funzione di unsubscribe
                const index = subscribers.indexOf(listener);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
            };
        }
        throw new Error("Listener must be a function");
    };

    return ref;
}function createEffect(effect, dependencies, runInitially = false) {
    if (typeof effect !== "function") {
        throw new Error("Effect must be a function");
    }

    if (!Array.isArray(dependencies)) {
        throw new Error("Dependencies must be an array");
    }

    // Run the effect initially if requested
    if (runInitially) effect();

    const unsubscribes = dependencies.map(dep => {
        if (dep && typeof dep.$$subscribe === "function") {
            // Dependency is a reactive object with $$subscribe method
            return dep.$$subscribe(() => effect());
        } else {
            throw new Error("Dependencies must be objects with the method $$subscribe");
        }
    });

    return () => {
        unsubscribes.forEach(unsubscribe => {
            if (typeof unsubscribe === "function") {
                unsubscribe();
            }
        });
    };
}function createPropertyObserver(target, path, callback = null) {
    if (typeof target !== "object" || target === null) {
        throw new Error("Target must be an object");
    }

    const parts = path.split('.');
    let current = target;
    for (let i = 0; i < parts.length - 1; i++) {
        current = current[parts[i]];
        if (typeof current !== "object" || current === null) {
            throw new Error(`Invalid property path: ${path}`);
        }
    }
    const prop = parts[parts.length - 1];

    const listeners = [];
    let value = current[prop];

    Object.defineProperty(current, prop, {
        get() {
            return value;
        },
        set(newValue) {
            const oldValue = value;
            value = newValue;
            listeners.forEach(callback => callback(newValue, oldValue));
            if (callback) callback(newValue, oldValue);
        },
        configurable: true,
        enumerable: true,
    });

    return {
        $$subscribe(callback) {
            listeners.push(callback);
            return () => {
                const index = listeners.indexOf(callback);
                if (index !== -1) listeners.splice(index, 1);
            };
        }
    };
}function createDerivedState(sourceState, transformer, ...args) {
    const [derived, setDerived] = createState(transformer(sourceState(), ...args));

    // Osserva cambiamenti nello stato di origine e aggiorna automaticamente quello derivato
    sourceState.$$subscribe((newValue) => {
        setDerived(transformer(newValue, ...args));
    });

    return derived;
}function For({ each, effect, getKey = (item) => item.id || item.name, tag = 'x-f', attributes = {} }) {
    function onInitialize(component) {
        const childStateMap = new Map(); // Mappa per gestire lo stato dei figli

        const updateChildren = (newItems) => {
            const newStateMap = new Map(); // Nuova mappa per gli stati aggiornati

            // Rigenera sempre tutti gli elementi
            newItems.forEach((item, index) => {
                const key = getKey(item); // Ottieni una chiave univoca per ogni elemento
                const state = childStateMap.get(key) || {};
                newStateMap.set(key, state);

                const child = effect(item, index, state); // Genera il figlio
                if (component.items.getAt(index)) {
                    component.removeAt(index);
                    component.insert(index, child);
                } else {
                    component.add(child);
                }
            });

            // Rimuove eventuali elementi extra
            while (component.items.length > newItems.length) {
                component.removeAt(component.items.length - 1);
            }

            // Aggiorna la mappa degli stati
            childStateMap.clear();
            for (const [key, value] of newStateMap.entries()) {
                childStateMap.set(key, value);
            }
        };

        if (Array.isArray(each)) {
            updateChildren(each);
        } else {
            updateChildren(each());
            if (each.$$isState) {
                each.$$subscribe(updateChildren);
            }
        }
    }

    return h`<${tag} ...${attributes} oninitialize="${onInitialize}"></>`;
}try {
    if (window) {
        generateHtmlClass();
    }
} catch (e) {}exports.For=For;exports.createDerivedState=createDerivedState;exports.createEffect=createEffect;exports.createPropertyObserver=createPropertyObserver;exports.createRef=createRef;exports.createState=createState;exports.defineExtClass=defineExtClass;exports.destroy=destroy;exports.generateHtmlClass=generateHtmlClass;exports.h=h;exports.initialize=initialize;}));