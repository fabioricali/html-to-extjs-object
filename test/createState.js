import {createState} from "../src/index.js";
import assert from "node:assert";

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

    it('should allow persistent state using a context', function () {
        const context = {}; // Contesto unico

        const [state1, setState1] = createState(0, context);

        setState1(42);

        const [state2] = createState(0, context);

        assert.strictEqual(state1(), 42);
        assert.strictEqual(state2(), 42);

        setState1(100);
        assert.strictEqual(state2(), 100);

        const [state3] = createState(0, {});
        assert.strictEqual(state3(), 0); // Stato isolato
    });

});