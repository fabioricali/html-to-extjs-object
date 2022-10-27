import extml from "../index.js";
import assert from 'node:assert';

describe('converts html to extjs object', function () {
    it('#1, simple component', function () {
        let result = extml`
            <segmentedbutton/>
        `;
        //console.log(result)
        assert.deepEqual(result, {xtype: 'segmentedbutton', items: [], listeners: [], html: ''});
    });

    it('#2, simple component returned by a function', function () {
        function MyComponent() {
            return extml`
                <toolbar/>
            `
        }
        let result = extml`
            <${MyComponent}/>
        `;
        //console.log(result)
        assert.deepEqual(result, {xtype: 'toolbar', items: [], listeners: [], html: ''});
    });

    it('#3, nested components v1', function () {
        function Child() {
            return extml`
                <button value="click me"/>
            `
        }
        function Mother() {
            return extml`
                <toolbar>
                    <${Child}/>
                </toolbar>
            `
        }
        let result = extml`
            <${Mother}/>
        `;
        //console.log(result)
        assert.deepEqual(result, {
            xtype: 'toolbar',
            items: [
                {
                    xtype: 'button',
                    items: [],
                    listeners: [],
                    html: '',
                    value: 'click me'
                }
            ],
            listeners: [],
            html: ''
        });
    });

    it('#4, nested components v2', function () {
        function Child() {
            return extml`
                <button value="click me"/>
            `
        }
        function Mother() {
            return extml`
                <toolbar/>
            `
        }
        let result = extml`
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
                    listeners: [],
                    html: '',
                    value: 'click me'
                }
            ],
            listeners: [],
            html: ''
        });
    });

    it('#5, listener and props', function () {
        function onPaintedHandle() {
            return true;
        }

        let result = extml`
            <segmentedbutton allowMultiple="${true}" onpainted="${onPaintedHandle}"/>
        `;
        //console.log(result)
        assert.equal(result.listeners[0].painted, onPaintedHandle)
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
            return extml`
                <toolbar docked="left" onpainted="${onPaintedHandle2}"/>
            `
        }

        let result = extml`
            <${MyComponent} docked="right" hidePanelStats="${true}" onpainted="${onPaintedHandle1}"/>
        `;
        //console.log(result)
        assert.equal(result.listeners[0].painted, onPaintedHandle2)
        assert.equal(result.listeners[1].painted, onPaintedHandle1)
        assert.equal(result.docked, 'right')
        assert.equal(result.hidePanelStats, true)

        let result2 = extml`
            <${MyComponent} onpainted="${onPaintedHandle1}"/>
        `;
        //console.log(result2)
        assert.equal(result2.listeners[0].painted, onPaintedHandle2)
        assert.equal(result2.listeners[1].painted, onPaintedHandle1)
        assert.equal(result2.docked, 'left')
        assert.equal(result2.hidePanelStats, undefined)
    });

    it('#7, html nested', function () {
        let myHtml = `<div>sss</div>`
        let result = extml`
            <toolbar>
                ${myHtml}
            </toolbar>
        `;
        //console.log(result)
        assert.deepEqual(result, { xtype: 'toolbar', items: [], listeners: [], html: '<div>sss</div>' });
    });


})