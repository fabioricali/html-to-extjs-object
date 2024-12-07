import {createState, conditionalState, createDerivedState} from "../src/index.js";
import assert from "node:assert";

function waiting() {
    return new Promise(resolve => setTimeout(resolve, 0));
}

describe('conditionalState', function () {

    it('should return default boolean values', async function () {
        const [myState, setMyState] = createState(0); // Modalità sincrona per i test
        const result = conditionalState(myState);

        setMyState(0);
        await waiting(); // Attendi che lo stato si aggiorni
        assert.equal(result(), false); // Stato iniziale: 0 è falsy, quindi false

        setMyState(10);
        await waiting(); // Attendi che lo stato si aggiorni
        assert.equal(result(), true); // Stato aggiornato: 10 è truthy, quindi true
    });

    it('should return custom values based on state', async function () {
        const [myState, setMyState] = createState(false); // Modalità sincrona per i test
        const result = conditionalState(myState, 'visible', 'hidden');

        setMyState(false);
        await waiting(); // Attendi che lo stato si aggiorni
        assert.equal(result(), 'hidden'); // Stato iniziale: false restituisce 'hidden'

        setMyState(true);
        await waiting(); // Attendi che lo stato si aggiorni
        assert.equal(result(), 'visible'); // Stato aggiornato: true restituisce 'visible'
    });

    it('should return custom values based on derived state', async function () {
        const [myStateA, setMyStateA] = createState(1);
        const [myStateB, setMyStateB] = createState(2);
        // const result = conditionalState(createDerivedState([myStateA, myStateB], (a, b) => a + b === 3));
        const result = createDerivedState(
            () => myStateA() + myStateB() === 3,
        );

        await waiting();
        assert.equal(result(), true);

        await setMyStateB(4)
        await waiting();
        assert.equal(result(), false);

        await setMyStateB(2)
        await waiting();
        assert.equal(result(), true);
    });

});
