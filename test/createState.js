import {createState} from "../src/index.js";
import assert from "node:assert";

describe('createState', function () {

    it('should create a state with a single value', function () {
        const [myState, setMyState] = createState(0, null, false, true); // Modalità sincrona per i test
        assert.equal(myState(), 0);

        setMyState(10);
        assert.equal(myState(), 10);
    });

    it('should create a state with a single value updated via callback', function () {
        const [myState, setMyState] = createState(0, null, false, true);
        assert.equal(myState(), 0);

        setMyState(currentState => currentState + 2);
        assert.equal(myState(), 2);

        setMyState(currentState => currentState + 3);
        assert.equal(myState(), 5);

        setMyState(currentState => currentState + 5);
        assert.equal(myState(), 10);
    });

    it('should create a state with an object value', function () {
        const [{ count, text }, setMyState] = createState({ count: 0, text: 'Hello' }, null, false, true);

        assert.equal(count(), 0);
        assert.equal(text(), 'Hello');

        setMyState({ count: 5 });
        assert.equal(count(), 5);
        assert.equal(text(), 'Hello'); // Verifica che `text` non sia cambiato
    });

    it('should create a state with an object value updated via callback', function () {
        const [{ count, text }, setMyState] = createState({ count: 0, text: 'Hello' });

        assert.equal(count(), 0);
        assert.equal(text(), 'Hello');

        setMyState(currentState => {
            currentState.count = 5;
            return currentState;
        });
        assert.equal(count(), 5);
        assert.equal(text(), 'Hello'); // Verifica che `text` non sia cambiato
    });

    it('should notify global listeners on state change', function () {
        const [{ count }, setMyState, subscribe] = createState({ count: 0 }, null, false, true);

        let globalState;
        subscribe((newState) => { globalState = newState; });

        setMyState({ count: 10 });
        assert.equal(globalState.count, 10);
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
        const [{ count }, setMyState] = createState({ count: 0 }, null, false, true);

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
        const [myArray, setMyArray] = createState([1, 2, 3], null, false, true);

        assert.deepEqual(myArray(), [1, 2, 3]);

        setMyArray([4, 5, 6]);
        assert.deepEqual(myArray(), [4, 5, 6]);
    });

    it('should handle Date objects as single entities', function () {
        const date = new Date();
        const [myDate, setMyDate] = createState(date, null, false, true);

        assert.equal(myDate().getTime(), date.getTime());

        const newDate = new Date(date.getTime() + 1000);
        setMyDate(newDate);
        assert.equal(myDate().getTime(), newDate.getTime());
    });

    it('should allow persistent state using a context', function () {
        const context = {}; // Contesto unico

        const [state1, setState1] = createState(0, context, false, true);

        setState1(42);

        const [state2] = createState(0, context);

        assert.strictEqual(state1(), 42);
        assert.strictEqual(state2(), 42);

        setState1(100);
        assert.strictEqual(state2(), 100);

        const [state3] = createState(0, {});
        assert.strictEqual(state3(), 0); // Stato isolato
    });

    it('should resolve the promise after state is updated', async function () {
        const [state, setState] = createState(0, null, false, false); // Modalità asincrona

        await setState(10);
        assert.strictEqual(state(), 10); // Il valore deve essere aggiornato dopo l'await
    });

    it('should resolve immediately for sync mode', async function () {
        const [state, setState] = createState(0, null, false, true); // Modalità sincrona

        const promise = setState(20);
        assert(promise instanceof Promise);
        await promise; // La promise dovrebbe essere già risolta
        assert.strictEqual(state(), 20); // Lo stato deve essere aggiornato immediatamente
    });

    it('should batch updates and resolve promise after all updates are processed', async function () {
        const [state, setState] = createState(0, null, false, false); // Modalità asincrona (batch)

        const promise1 = setState(30);
        const promise2 = setState(50);

        await promise1; // Attendi la risoluzione del primo aggiornamento in batch
        assert.strictEqual(state(), 50); // Deve riflettere l'ultimo aggiornamento

        await promise2; // Il secondo deve essere già risolto

        // Stato finale dovrebbe essere 50 perché è l'ultimo valore impostato
        assert.strictEqual(state(), 50);
    });

    it('should notify all listeners before resolving promise', async function () {
        const [{ count }, setState, subscribe] = createState({ count: 0 }, null, false, false); // Modalità asincrona (batch)

        let listenerNotified = false;
        subscribe(() => { listenerNotified = true; });

        await setState({ count: 100 });

        assert.strictEqual(count(), 100);
        assert.strictEqual(listenerNotified, true); // Il listener deve essere notificato prima della risoluzione
    });

    it('should not notify global listeners if no change in state', function () {
        const [{ count }, setState, subscribe] = createState({ count: 0 }, null, false, true); // Modalità sincrona

        let globalCalled = false;
        subscribe(() => { globalCalled = true; });

        setState({ count: 0 });
        assert.strictEqual(globalCalled, false); // Nessuna notifica per cambiamenti inutili
    });

});