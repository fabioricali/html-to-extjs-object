import {h, initialize, destroy} from "../src/index.js";
import assert from 'node:assert';

let defaultListeners = [
    {
        initialize
    },
    {
        destroy
    }
]

describe('converts html to extjs object', function () {
    it('#1, simple component', function () {
        let result = h`
            <segmentedbutton/>
        `;
        //console.log(result)
        assert.deepEqual(result, {xtype: 'segmentedbutton', listeners: Object.assign([], defaultListeners)});
    });

    it('#2, simple component returned by a function', function () {
        function MyComponent() {
            return h`
                <toolbar/>
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
                <button value="click me"/>
            `
        }
        function Mother() {
            return h`
                <toolbar>
                    <${Child}/>
                </toolbar>
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
                <button value="click me"/>
            `
        }
        function Mother() {
            return h`
                <toolbar/>
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
            <segmentedbutton allowMultiple="${true}" onpainted="${onPaintedHandle}"/>
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
                <toolbar docked="left" onpainted="${onPaintedHandle2}"/>
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
            <toolbar>
                ${myHtml}
            </toolbar>
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
            <toolbar>
                ${myHtml}
            </toolbar>
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
                <toolbar/>
            </context>
        `;
        //console.log(result)
        assert.notEqual(result.contextName, undefined)
        //assert.deepEqual(result, { xtype: 'toolbar', listeners: Object.assign([], defaultListeners), html: '<div>sss</div>' });
    });

    it('#10, grid', function () {
        let result = h`
            <grid>
                <booleancolumn/>
                <textcolumn/>
                <booleancolumn/>
                <checkcolumn/>
                <datecolumn/>
                <numbercolumn/>
                <rownumberer/>
                <textcolumn/>
                <treecolumn/>
            </grid>
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
            <toolbar controller="${myController}"/>
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
            <toolbar controller="${myController}"/>
        `;
        //console.log(result)
        assert.notEqual(result.controller.control, undefined)
    })

})