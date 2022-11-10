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

export function generateHtmlClass () {
    if (!window.__extHtmlClass) {
        window.__extHtmlClass = {};
        htmlTags.forEach(tag => defineExtClass(tag));
    }
}