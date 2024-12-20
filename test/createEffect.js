import assert from 'node:assert';
import { createEffect, createPropertyObserver } from "../src/index.js";

// Mock for a dependency with the $$subscribe method
function createMockDependency() {
    const listeners = [];
    return {
        $$isState: true,
        $$subscribe(callback) {
            listeners.push(callback);
            return () => {
                const index = listeners.indexOf(callback);
                if (index !== -1) listeners.splice(index, 1);
            };
        },
        trigger() {
            listeners.forEach(callback => callback());
        },
    };
}

describe('createEffect', function () {
    it('should throw an error if `effect` is not a function', function () {
        assert.throws(() => createEffect(null, []), /Effect must be a function/);
    });

    it('should throw an error if `dependencies` is not an array of objects with $$subscribe', function () {
        assert.throws(() => createEffect(() => {}, [null]), /Dependencies must be objects with the method \$\$subscribe/);
    });

    it('should execute `effect` immediately if `runInitially` is true', function () {
        let effectRun = false;
        const effect = () => { effectRun = true; };
        const dependency = createMockDependency();

        createEffect(effect, [dependency], true);

        assert.strictEqual(effectRun, true);
    });

    it('should not execute `effect` immediately if `runInitially` is false', function () {
        let effectRun = false;
        const effect = () => { effectRun = true; };
        const dependency = createMockDependency();

        createEffect(effect, [dependency], false);

        assert.strictEqual(effectRun, false);
    });

    it('should execute `effect` when a dependency changes', function () {
        let effectRunCount = 0;
        const effect = () => { effectRunCount += 1; };
        const dependency = createMockDependency();

        createEffect(effect, [dependency], false);

        assert.strictEqual(effectRunCount, 0);

        // Trigger the dependency
        dependency.trigger();
        assert.strictEqual(effectRunCount, 1);
    });

    it('should execute `effect` when an observed object property changes', function () {
        let effectRunCount = 0;
        const effect = () => { effectRunCount += 1; };
        const target = { nested: { prop: 1 } };
        const observedDependency = createPropertyObserver(target, 'nested.prop');

        createEffect(effect, [observedDependency], false);

        assert.strictEqual(effectRunCount, 0);

        // Change the observed property
        target.nested.prop = 2;
        assert.strictEqual(effectRunCount, 1);
    });

    it('cleanup function should unsubscribe all dependencies', function () {
        let effectRunCount = 0;
        const effect = () => { effectRunCount += 1; };
        const dependency = createMockDependency();

        const cleanup = createEffect(effect, [dependency], false);

        // Trigger the dependency
        dependency.trigger();
        assert.strictEqual(effectRunCount, 1);

        // Cleanup
        cleanup();

        // Trigger the dependency after cleanup
        dependency.trigger();
        assert.strictEqual(effectRunCount, 1); // Should not be called again
    });

    it('should execute callback when observed property changes', function () {
        let callbackRunCount = 0;
        const target = { nested: { prop: 1 } };
        createPropertyObserver(target, 'nested.prop', () => { callbackRunCount += 1; });

        assert.strictEqual(callbackRunCount, 0);

        // Change the observed property
        target.nested.prop = 2;
        assert.strictEqual(callbackRunCount, 1);
    });

    it('should execute callback with old and new values when observed property changes', function () {
        let oldValue, newValue;
        const target = { nested: { prop: 1 } };
        createPropertyObserver(target, 'nested.prop', (newVal, oldVal) => {
            newValue = newVal;
            oldValue = oldVal;
        });

        assert.strictEqual(newValue, undefined);
        assert.strictEqual(oldValue, undefined);

        // Change the observed property
        target.nested.prop = 2;
        assert.strictEqual(newValue, 2);
        assert.strictEqual(oldValue, 1);
    });

});
