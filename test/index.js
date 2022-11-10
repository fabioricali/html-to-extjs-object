import { GlobalRegistrator } from '@happy-dom/global-registrator';
GlobalRegistrator.register();
import {h, initialize, destroy, generateHtmlClass} from "../src/index.js";
import assert from 'node:assert';

window.Ext = {
    define(className, config) {
        return config
    },
    create(className, config) {
        return config
    }
}

generateHtmlClass()

let defaultListeners = [
    {
        initialize
    },
    {
        destroy
    }
]

generateHtmlClass()

describe('converts html to extjs object', function () {
    it('#1, simple component', function () {
        let result = h`
            <ext-segmentedbutton/>
        `;
        //console.log(result)
        assert.deepEqual(result, {xtype: 'segmentedbutton', listeners: Object.assign([], defaultListeners)});
    });

    it('#2, simple component returned by a function', function () {
        function MyComponent() {
            return h`
                <ext-toolbar/>
            `
        }
        let result = h`
            <${MyComponent}/>
        `;
        //console.log(result)
        assert.deepEqual(result, {xtype: 'toolbar', listeners: Object.assign([], defaultListeners)});
    });

    it('#3, nested components v1', function () {
        function Child() {
            return h`
                <ext-button value="click me"/>
            `
        }
        function Mother() {
            return h`
                <ext-toolbar>
                    <${Child}/>
                </ext-toolbar>
            `
        }
        let result = h`
            <${Mother}/>
        `;
        //console.log(result)
        assert.deepEqual(result, {
            xtype: 'toolbar',
            items: [
                {
                    xtype: 'button',
                    listeners: defaultListeners,
                    value: 'click me'
                }
            ],
            listeners: defaultListeners
        });
    });

    it('#4, nested components v2', function () {
        function Child() {
            return h`
                <ext-button value="click me"/>
            `
        }
        function Mother() {
            return h`
                <ext-toolbar/>
            `
        }
        let result = h`
            <${Mother}>
                <${Child}/>
            </>
        `;
        //console.log(result)
        assert.deepEqual(result, {
            xtype: 'toolbar',
            items: [
                {
                    xtype: 'button',
                    listeners: defaultListeners,
                    value: 'click me'
                }
            ],
            listeners: defaultListeners
        });
    });

    it('#5, listener and props', function () {
        function onPaintedHandle() {
            return true;
        }

        let result = h`
            <ext-segmentedbutton allowMultiple="${true}" onpainted="${onPaintedHandle}"/>
        `;
        //console.log(result)
        assert.equal(result.listeners[2].painted, onPaintedHandle)
        assert.equal(result.allowMultiple, true)
        //assert.deepEqual(result, {xtype: 'segmentedbutton', items: [], listeners: {}, html: ''});
    });

    it('#6, listener and override ', function () {
        function onPaintedHandle1() {
            return true;
        }

        function onPaintedHandle2() {
            return true;
        }

        function MyComponent(props) {
            //console.log('--->', props)
            return h`
                <ext-toolbar docked="left" onpainted="${onPaintedHandle2}"/>
            `
        }

        let result = h`
            <${MyComponent} docked="right" hidePanelStats="${true}" onpainted="${onPaintedHandle1}"/>
        `;
        //console.log(result)
        assert.equal(result.listeners[2].painted, onPaintedHandle2)
        assert.equal(result.listeners[3].painted, onPaintedHandle1)
        assert.equal(result.docked, 'right')
        assert.equal(result.hidePanelStats, true)

        let result2 = h`
            <${MyComponent} onpainted="${onPaintedHandle1}"/>
        `;
        //console.log(result2)
        assert.equal(result2.listeners[2].painted, onPaintedHandle2)
        assert.equal(result2.listeners[3].painted, onPaintedHandle1)
        assert.equal(result2.docked, 'left')
        assert.equal(result2.hidePanelStats, undefined)
    });

    it('#7, html nested', function () {
        let myHtml = `<div>sss</div>`
        let result = h`
            <ext-toolbar>
                ${myHtml}
            </ext-toolbar>
        `;
        //console.log(result)
        assert.deepEqual(result, { xtype: 'toolbar', listeners: Object.assign([], defaultListeners), html: '<div>sss</div>' });
    });

    it('#8, scoped style', function () {
        let myHtml = `<div>sss</div>`
        let result = h`
            <style> 
                :component {
                    border: 1px solid red;
                }
            </style>
            <ext-toolbar>
                ${myHtml}
            </ext-toolbar>
        `;
        //console.log(result)
        assert.notEqual(result.stylesheet, undefined)
        //assert.deepEqual(result, { xtype: 'toolbar', listeners: Object.assign([], defaultListeners), html: '<div>sss</div>' });
    });

    it('#9, context', function () {
        let result = h`
            <style> 
                :component {
                    border: 1px solid red;
                }
            </style>
            <context name="myContext">
                <ext-toolbar/>
            </context>
        `;
        //console.log(result)
        assert.notEqual(result.contextName, undefined)
        //assert.deepEqual(result, { xtype: 'toolbar', listeners: Object.assign([], defaultListeners), html: '<div>sss</div>' });
    });

    it('#10, grid', function () {
        let result = h`
            <ext-grid>
                <ext-booleancolumn/>
                <ext-textcolumn/>
                <ext-booleancolumn/>
                <ext-checkcolumn/>
                <ext-datecolumn/>
                <ext-numbercolumn/>
                <ext-rownumberer/>
                <ext-textcolumn/>
                <ext-treecolumn/>
            </ext-grid>
        `;
        //console.log(result)
        assert.notEqual(result.columns, undefined)
        assert.equal(result.columns[0].xtype, 'booleancolumn')
        assert.equal(result.columns[8].xtype, 'treecolumn')
        //assert.deepEqual(result, { xtype: 'toolbar', listeners: Object.assign([], defaultListeners), html: '<div>sss</div>' });
    });

    it('#11, controller by object', function () {
        let myController = {
            control: {
                '#mySelector': {
                    tap() {}
                }
            }
        }

        let result = h`
            <ext-toolbar controller="${myController}"/>
        `;
        //console.log(result)
        assert.notEqual(result.controller.control, undefined)
    })

    it('#11, controller by function', function () {
        let myController = function () {
            return {
                control: {
                    '#mySelector': {
                        tap() {}
                    }
                }
            }
        }

        let result = h`
            <ext-toolbar controller="${myController}"/>
        `;
        //console.log(result)
        assert.notEqual(result.controller.control, undefined)
    })

    it('#12, menu inside a button', function () {

        //language=html
        let result = h`
            <ext-button text="Export foo"> 
               <ext-menu>
                   <ext-button text="button 1"/>
                   <ext-button text="button 2"/>
               </ext-menu>
            </ext-button>
        `;
        //console.log(result)
        assert.notEqual(result.menu, undefined)
    })

    it('#9, context', function () {
        function createContext() {}
        let result = h`
            <style> 
                :component {
                    border: 1px solid red;
                }
            </style>
            <toolbar context="toolbar">
                <button itemid="button1" text="button1"/>
                <button itemid="button2" text="button2"/>
            </toolbar>
        `;
        console.log(result)
        //assert.notEqual(result.stylesheet, undefined)
        //assert.deepEqual(result, { xtype: 'toolbar', listeners: Object.assign([], defaultListeners), html: '<div>sss</div>' });
    });

})