import assert from 'assert';
import {createDerivedState} from "../src/index.js";
import {createState} from "../src/index.js";

describe('createDerivedState', function () {

    it('should return the derived initial value', function () {
        const [sourceState, setSourceState] = createState(1000);
        const derivedState = createDerivedState(sourceState, (value) => value * 2);
        assert.strictEqual(derivedState(), 2000);
    });

    it('should update the derived state when source state changes', function () {
        const [sourceState, setSourceState] = createState(500);
        const derivedState = createDerivedState(sourceState, (value) => value + 100);

        // Initial derived value
        assert.strictEqual(derivedState(), 600);

        // Update source state
        setSourceState(700);
        assert.strictEqual(derivedState(), 800);
    });

    it('should apply transformation with optional parameters', function () {
        const [sourceState, setSourceState] = createState(5);
        const derivedState = createDerivedState(sourceState, (value, multiplier) => value * multiplier, 3);

        assert.strictEqual(derivedState(), 15); // 5 * 3

        // Update source state
        setSourceState(10);
        assert.strictEqual(derivedState(), 30); // 10 * 3
    });

    it('should handle complex transformations with multiple optional parameters', function () {
        const [sourceState, setSourceState] = createState(2);
        const derivedState = createDerivedState(sourceState, (value, multiplier, offset) => value * multiplier + offset, 4, 10);

        assert.strictEqual(derivedState(), 18); // (2 * 4) + 10

        // Update source state
        setSourceState(3);
        assert.strictEqual(derivedState(), 22); // (3 * 4) + 10
    });

    it('should not update derived state if new source value does not affect derived result', function () {
        const [sourceState, setSourceState] = createState(3);
        const derivedState = createDerivedState(sourceState, (value) => value % 2 === 0 ? "even" : "odd");

        assert.strictEqual(derivedState(), "odd");

        // Changing source state to another odd number should keep derived state unchanged
        setSourceState(5);
        assert.strictEqual(derivedState(), "odd");
    });

    it('should update derived state only when one of the source states affects the result', function () {
        const [stateA, setStateA] = createState(4);
        const [stateB, setStateB] = createState(3);
        const derivedState = createDerivedState([stateA, stateB], (a, b) => a > b ? "A is greater" : "B is greater or equal");

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

});
