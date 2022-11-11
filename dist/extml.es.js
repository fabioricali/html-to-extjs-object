/* Extml, version: 2.1.0 - November 11, 2022 09:59:15 */
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
    Ext.getApplication().context = Ext.getApplication().context || {};
    this.context = Ext.getApplication().context;
    let controller = this.getController();
    //append context to controller
    if (controller) {
        controller.context = this.context;
    }
    if (this.contextName) {
        this.context[this.contextName] = /*this.context[this.contextName] ||*/ {};
        this.context[this.contextName][this.getItemId()] = this;
        this.query('*').forEach(item => {
            this.context[this.contextName][item.getItemId()] = item;
        });
    }
}function initialize() {
    createStyle.apply(this);
    createContext.apply(this);
}

function destroy() {
    destroyStyle.apply(this);
}const htmlTags = ["a", "abbr", "acronym", "address", "applet", "area", "article", "aside", "audio", "b", "base", "basefont", "bdi", "bdo", "bgsound", "big", "blink", "blockquote", "body", "br", "button", "canvas", "caption", "center", "cite", "code", "col", "colgroup", "command", "content", "data", "datalist", "dd", "del", "details", "dfn", "dialog", "dir", "div", "dl", "dt", "element", "em", "embed", "fieldset", "figcaption", "figure", "font", "footer", "form", "frame", "frameset", "h1", "h2", "h3", "h4", "h5", "h6", "head", "header", "hgroup", "hr", "html", "i", "iframe", "image", "img", "input", "ins", "isindex", "kbd", "keygen", "label", "legend", "li", "link", "listing", "main", "map", "mark", "marquee", "math", "menu", "menuitem", "meta", "meter", "multicol", "nav", "nextid", "nobr", "noembed", "noframes", "noscript", "object", "ol", "optgroup", "option", "output", "p", "param", "picture", "plaintext", "pre", "progress", "q", "rb", "rbc", "rp", "rt", "rtc", "ruby", "s", "samp", "script", "section", "select", "shadow", "slot", "small", "source", "spacer", "span", "strike", "strong", "style", "sub", "summary", "sup", "svg", "table", "tbody", "td", "template", "textarea", "tfoot", "th", "thead", "time", "title", "tr", "track", "tt", "u", "ul", "var", "video", "wbr", "xmp"];function defineExtClass(tag) {
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
            // let me = this,
            //     innerHtmlElement = me.innerHtmlElement;
            // if (!innerHtmlElement || !innerHtmlElement.dom || !innerHtmlElement.dom.parentNode) {
            //     me.innerHtmlElement = innerHtmlElement = Ext.Element.create({
            //         tag: 'ghost-tag',
            //         cls: '',
            //     });
            //     me.getRenderTarget().appendChild(innerHtmlElement);
            // }
            // return innerHtmlElement;
        },
        listeners: [
            {
                initialize() {
                    //hack
                    requestAnimationFrame(() => {
                        this.el.dom.className = '';
                        this.innerElement.dom.className = '';
                        if (this._propsAttributes) {
                            Object.keys(this._propsAttributes).forEach(attribute => {
                                if (typeof this._propsAttributes[attribute] === 'function') {
                                    this.el.dom.addEventListener(attribute.substring(2), this._propsAttributes[attribute]);
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
}function createComponentConfig(type, props, children, propsFunction) {

    // default configuration
    let componentConfig = {
        xtype: type.toLowerCase(),
        listeners: [
            createEventObject('initialize', initialize),
            createEventObject('destroy', destroy)
        ]
    };

    let configFromProps = Object.assign({}, props, propsFunction);
    let isHtmlType = (configFromProps.xtype || type).startsWith('html-');

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
}function detectClassType(xtype) {
    if (xtype.startsWith('ext-')) {
        xtype = xtype.split('ext-')[1];
    } else {
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
}try {
    if (window) {
        generateHtmlClass();
    }
} catch (e) {}export{destroy,generateHtmlClass,h,initialize};