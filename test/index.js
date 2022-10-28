import {h, createStyle, destroyStyle} from "../index.js";
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
        assert.deepEqual(result, {xtype: 'segmentedbutton', items: [], listeners: Object.assign([], defaultListeners), html: ''});
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
        assert.deepEqual(result, {xtype: 'toolbar', items: [], listeners: Object.assign([], defaultListeners), html: ''});
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
                    items: [],
                    listeners: defaultListeners,
                    html: '',
                    value: 'click me'
                }
            ],
            listeners: defaultListeners,
            html: ''
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
                    items: [],
                    listeners: defaultListeners,
                    html: '',
                    value: 'click me'
                }
            ],
            listeners: defaultListeners,
            html: ''
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
        assert.deepEqual(result, { xtype: 'toolbar', items: [], listeners: Object.assign([], defaultListeners), html: '<div>sss</div>' });
    });

})