import { GlobalRegistrator } from '@happy-dom/global-registrator';
GlobalRegistrator.register();
import {h, initialize, destroy, generateHtmlClass, createState, createRef} from "../src/index.js";
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
        // console.log(result)
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

    it('#12, controller by function', function () {
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

    it('#13, menu inside a button', function () {

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

    it('#14, class property instead cls', function () {
        function createContext() {}
        let result = h`
            <style> 
                :component {
                    border: 1px solid red;
                }
            </style>
            <ext-toolbar class="my-toolbar">
                <ext-button itemId="button1" text="button1"/>
                <ext-button itemId="button2" text="button2"/>
            </ext-toolbar>
        `;
        //console.log(result)
        assert.equal(result.cls, 'my-toolbar')
    });

    it('#15, column with widgetcell', function () {
        let result = h`
            <ext-column>
                <ext-widgetcell forceWidth="${true}">
                    <ext-button iconCls="x-fa fas fa-eye" text="download"/>
                </ext-widgetcell>
            </ext-column>
        `;
        // console.log(JSON.stringify(result, null, 4))
        assert.equal(result.cell.xtype, 'widgetcell');
        assert.equal(result.cell.widget.items[0].xtype, 'button');
    });

    it('#16, html with expression as placeholder', function () {
        let result = h`
            <ext-toolbar>
                <div>${1+2}</div>
            </ext-toolbar>
        `;
        //console.log(JSON.stringify(result, null, 4))
        assert.equal(result.items[0].html, '3');
    });

    it('#17, html with function as placeholder', function () {
        let result = h`
            <ext-toolbar>
                <div>${() => 1+2}</div>
            </ext-toolbar>
        `;
        // console.log(JSON.stringify(result, null, 4))
        assert.equal(result.items[0].html, '3');
    });

    it('#18, column with button inside without widget', function () {
        let result = h`
            <ext-column>
                <ext-button iconCls="x-fa fas fa-eye" text="download"/>
            </ext-column>
        `;
        // console.log(JSON.stringify(result, null, 4))
        assert.equal(result.cell.xtype, 'widgetcell');
        assert.equal(result.cell.widget.items[0].xtype, 'button');
    });
})

describe('createState', function () {

    it('should create a state with a single value', function () {
        const [myState, setMyState] = createState(0);
        assert.equal(myState(), 0);

        setMyState(10);
        assert.equal(myState(), 10);
    });

    it('should create a state with an object value', function () {
        const [{ count, text }, setMyState] = createState({ count: 0, text: 'Hello' });

        assert.equal(count(), 0);
        assert.equal(text(), 'Hello');

        setMyState({ count: 5 });
        assert.equal(count(), 5);
        assert.equal(text(), 'Hello'); // Verifica che `text` non sia cambiato
    });

    it('should notify global listeners on state change', function () {
        const [{ count }, setMyState, subscribe] = createState({ count: 0 });

        let globalState;
        subscribe((newState) => { globalState = newState; });

        setMyState({ count: 10 });
        assert.equal(globalState.count, 10);
    });

    it('should notify only the specific property listener on change', function () {
        const [{ count }, setMyState] = createState({ count: 0, text: 'Hello' });

        let specificValue;
        count.$$subscribe((newCount) => { specificValue = newCount; });

        setMyState({ count: 5 });
        assert.equal(specificValue, 5); // Verifica che il listener della proprietà sia stato notificato
    });

    it('should not notify property listener if value remains the same', function () {
        const [{ count }, setMyState] = createState({ count: 0 });

        let specificValue;
        count.$$subscribe((newCount) => { specificValue = newCount; });

        setMyState({ count: 0 });
        assert.equal(specificValue, undefined); // Il valore non cambia, quindi nessuna notifica
    });

    it('should allow updating a specific property using setMyState.property', function () {
        const [{ count, text }, setMyState] = createState({ count: 0, text: 'Hello' });

        setMyState.count(15);
        assert.equal(count(), 15);
        assert.equal(text(), 'Hello'); // Verifica che `text` non sia cambiato

        setMyState.text('Updated');
        assert.equal(text(), 'Updated');
    });

    it('should not notify global listeners if no change in state', function () {
        const [{ count }, setMyState, subscribe] = createState({ count: 0 });

        let globalCalled = false;
        subscribe(() => { globalCalled = true; });

        setMyState({ count: 0 });
        assert.equal(globalCalled, false); // Nessuna notifica per cambiamenti inutili
    });

    it('should allow multiple subscriptions to a single property and notify all listeners', function () {
        const [{ count }, setMyState] = createState({ count: 0 });

        let listener1, listener2;
        count.$$subscribe((newCount) => { listener1 = newCount; });
        count.$$subscribe((newCount) => { listener2 = newCount; });

        setMyState({ count: 10 });
        assert.equal(listener1, 10);
        assert.equal(listener2, 10);
    });

    it('should return a function with $$isState and $$subscribe for each property', function () {
        const [{ count, text }] = createState({ count: 0, text: 'Hello' });

        assert.equal(count.$$isState, true);
        assert.equal(typeof count.$$subscribe, 'function');

        assert.equal(text.$$isState, true);
        assert.equal(typeof text.$$subscribe, 'function');
    });

    it('should handle arrays as single entities', function () {
        const [myArray, setMyArray] = createState([1, 2, 3]);

        assert.deepEqual(myArray(), [1, 2, 3]);

        setMyArray([4, 5, 6]);
        assert.deepEqual(myArray(), [4, 5, 6]);
    });

    it('should handle Date objects as single entities', function () {
        const date = new Date();
        const [myDate, setMyDate] = createState(date);

        assert.equal(myDate().getTime(), date.getTime());

        const newDate = new Date(date.getTime() + 1000);
        setMyDate(newDate);
        assert.equal(myDate().getTime(), newDate.getTime());
    });
});

describe('createRef', function () {
    it('#1 declaration', function () {
        const myColumRef = createRef()

        let result = h`
            <ext-column ref="${myColumRef}">
                <ext-button iconCls="x-fa fas fa-eye" text="download"/>
            </ext-column>
        `;
        console.log(JSON.stringify(result, null, 4))
        // assert.equal(result.cell.xtype, 'widgetcell');
        // assert.equal(result.cell.widget.items[0].xtype, 'button');
    });
})