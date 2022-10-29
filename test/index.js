import {h} from "../src/index.js";
import {createStyle, destroyStyle} from "../src/style.js";
import assert from 'node:assert';

let defaultListeners = [
    {
        initialize: createStyle
    },
    {
        destroy: destroyStyle
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

})