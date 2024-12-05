import assert from 'assert';
import {createDerivedState} from "../src/index.js";
import {createState} from "../src/index.js";

describe('createDerivedState', function () {

    it('should return the derived initial value', function () {
        const [sourceState, setSourceState] = createState(1000, null, false, true);
        const derivedState = createDerivedState(sourceState, (value) => value * 2);
        assert.strictEqual(derivedState(), 2000);
    });

    it('should update the derived state when source state changes', function () {
        const [sourceState, setSourceState] = createState(500, null, false, true); // Modalità sincrona
        const derivedState = createDerivedState(sourceState, (value) => value + 100, true); // Modalità sincrona

        // Initial derived value
        assert.strictEqual(derivedState(), 600);

        // Update source state
        setSourceState(700);
        assert.strictEqual(derivedState(), 800);
    });


    it('should apply transformation with optional parameters', function () {
        const [sourceState, setSourceState] = createState(5, null, false, true);
        const derivedState = createDerivedState(sourceState, (value, multiplier) => value * multiplier, true,3);

        assert.strictEqual(derivedState(), 15); // 5 * 3

        // Update source state
        setSourceState(10);
        assert.strictEqual(derivedState(), 30); // 10 * 3
    });

    it('should handle complex transformations with multiple optional parameters', function () {
        const [sourceState, setSourceState] = createState(2, null, false, true);
        const derivedState = createDerivedState(sourceState, (value, multiplier, offset) => value * multiplier + offset, true, 4, 10);

        assert.strictEqual(derivedState(), 18); // (2 * 4) + 10

        // Update source state
        setSourceState(3);
        assert.strictEqual(derivedState(), 22); // (3 * 4) + 10
    });

    it('should not update derived state if new source value does not affect derived result', function () {
        const [sourceState, setSourceState] = createState(3, null, false, true);
        const derivedState = createDerivedState(sourceState, (value) => value % 2 === 0 ? "even" : "odd", true);

        assert.strictEqual(derivedState(), "odd");

        // Changing source state to another odd number should keep derived state unchanged
        setSourceState(5);
        assert.strictEqual(derivedState(), "odd");
    });

    it('should update derived state only when one of the source states affects the result', function () {
        const [stateA, setStateA] = createState(4, null, false, true);
        const [stateB, setStateB] = createState(3, null, false, true);
        const derivedState = createDerivedState([stateA, stateB], (a, b) => a > b ? "A is greater" : "B is greater or equal", true);

        // Initial check
        assert.strictEqual(derivedState(), "A is greater");

        // Updating stateB to be greater should update derived state
        setStateB(5);
        assert.strictEqual(derivedState(), "B is greater or equal");

        // Changing stateA to a lower value, which does not change derived result
        setStateA(3);
        assert.strictEqual(derivedState(), "B is greater or equal");

        // Now make stateA greater again
        setStateA(6);
        assert.strictEqual(derivedState(), "A is greater");
    });

    it('should call the derived state initially with the correct value', function () {
        const [sourceState, setSourceState] = createState(10, null, false, true);
        const derivedState = createDerivedState(sourceState, (value) => value * 2, true);

        // Il valore derivato dovrebbe essere inizialmente il doppio di sourceState
        assert.strictEqual(derivedState(), 20);

        // Aggiorniamo lo stato di origine e verifichiamo il valore derivato
        setSourceState(15);
        assert.strictEqual(derivedState(), 30);

        // Impostiamo di nuovo uno stato di origine a zero e verifichiamo che il derivato si aggiorni correttamente
        setSourceState(0);
        assert.strictEqual(derivedState(), 0);
    });

    it('should update derived state after awaiting source state update', async function () {
        const [sourceState, setSourceState] = createState(5, null, false, false); // Modalità asincrona (batch)
        const derivedState = createDerivedState(sourceState, (value) => value * 2, false); // Modalità asincrona

        // Aggiorna lo stato di origine e attendi l'aggiornamento
        await setSourceState(10);

        // Attendere un microtask per assicurarsi che il derivato sia aggiornato
        await new Promise((resolve) => queueMicrotask(resolve));

        assert.strictEqual(derivedState(), 20); // Stato derivato dovrebbe essere aggiornato
    });

    it('should not notify derived state listener if derived value does not change', async function () {
        const [sourceState, setSourceState] = createState(5, null, false, false); // Modalità asincrona (batch)
        const derivedState = createDerivedState(sourceState, (value) => (value > 5 ? 10 : 0), false); // Modalità asincrona

        let derivedCalled = false;
        derivedState.$$subscribe(() => { derivedCalled = true; });

        await setSourceState(4); // La funzione di trasformazione restituisce ancora 0
        assert.strictEqual(derivedCalled, false); // Nessuna notifica se il valore derivato non cambia
    });

    it('should share derived state between multiple derived instances', async function () {
        const [sourceState, setSourceState] = createState(5, null, false, false); // Modalità asincrona
        const derivedState1 = createDerivedState(sourceState, (value) => value * 2, false); // Modalità asincrona
        const derivedState2 = createDerivedState(sourceState, (value) => value * 2, false); // Modalità asincrona

        // Aggiorna lo stato di origine e attendi l'aggiornamento
        await setSourceState(15);
        await new Promise((resolve) => queueMicrotask(resolve));

        assert.strictEqual(derivedState1(), 30); // Stato derivato 1 dovrebbe essere aggiornato
        assert.strictEqual(derivedState2(), 30); // Stato derivato 2 dovrebbe essere aggiornato
    });

    it('should not recompute derived state if source state is unchanged', function () {
        const [sourceState, setSourceState] = createState(10, null, false, true); // Modalità sincrona
        const derivedState = createDerivedState(sourceState, (value) => value + 5, true); // Modalità sincrona

        let derivedCalled = 0;
        derivedState.$$subscribe(() => { derivedCalled++; });

        setSourceState(10); // Nessun cambiamento nello stato di origine
        assert.strictEqual(derivedCalled, 0); // Il listener derivato non dovrebbe essere chiamato
    });

    it('should update derived state when multiple source states change', async function () {
        const [sourceState1, setSourceState1] = createState(3, null, false, false); // Modalità asincrona
        const [sourceState2, setSourceState2] = createState(4, null, false, false); // Modalità asincrona
        const derivedState = createDerivedState([sourceState1, sourceState2], (a, b) => a + b, false); // Modalità asincrona

        // Valore derivato iniziale
        assert.strictEqual(derivedState(), 7);

        // Aggiorna gli stati di origine e attendi l'aggiornamento
        await setSourceState1(5);
        await setSourceState2(6);
        await new Promise((resolve) => queueMicrotask(resolve));

        assert.strictEqual(derivedState(), 11); // Stato derivato aggiornato
    });
});
