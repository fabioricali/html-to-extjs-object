import {htmlTags} from "./htmlTags.js";

export function defineExtClass(tag) {
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
                if (this.__initializeHackAttempts > 100) {
                    console.warn('this.el.dom not found')
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
                            this._propsAttributes[attribute](o.el.dom)
                        } else if (this._propsAttributes[attribute].$$isState) {
                            this.el.dom.setAttribute(attribute, String(this._propsAttributes[attribute]()));
                            o.$$stateListener = this._propsAttributes[attribute].$$subscribe(value => {
                                this.el.dom.setAttribute(attribute, String(value));
                            })
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
                                        }))
                                    }
                                })

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
                        o.$$stateListener()
                    }

                    if (o.$$attributesStateListeners) {
                        o.$$attributesStateListeners.forEach(listener => listener());
                    }
                }
            }
        ]
    });
}

export function generateHtmlClass () {
    if (!window.__extHtmlClass) {
        window.__extHtmlClass = {};
        htmlTags.forEach(tag => defineExtClass(tag));
    }
}