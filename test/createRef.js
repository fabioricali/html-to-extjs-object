import assert from 'assert';
import createRef from "../src/createRef.js";

describe('createRef', function () {

    it('should act as a getter and return the initial value', function () {
        const myRef = createRef();
        assert.strictEqual(myRef(), null);
    });

    it('should act as a setter and update the value', function () {
        const myRef = createRef();
        myRef("New Value");
        assert.strictEqual(myRef(), "New Value");
    });

    it('should invoke the `onChange` callback when the value changes', function () {
        let callbackValue = null;
        const myRef = createRef((newValue) => {
            callbackValue = newValue;
        });
        myRef("New Value");
        assert.strictEqual(callbackValue, "New Value");
    });

    it('should have a `$$isRef` property set to true', function () {
        const myRef = createRef();
        assert.strictEqual(myRef.$$isRef, true);
    });

    it('should allow subscriptions and notify listeners on value changes', function () {
        const myRef = createRef();
        let notifiedValue = null;

        myRef.$$subscribe((newValue) => {
            notifiedValue = newValue;
        });

        myRef("Changed Value");
        assert.strictEqual(notifiedValue, "Changed Value");
    });

    it('should return an unsubscribe function that removes the listener', function () {
        const myRef = createRef();
        let notifiedValue = null;

        const unsubscribe = myRef.$$subscribe((newValue) => {
            notifiedValue = newValue;
        });

        myRef("First Change");
        assert.strictEqual(notifiedValue, "First Change");

        // Unsubscribe and change value again
        unsubscribe();
        myRef("Second Change");
        assert.strictEqual(notifiedValue, "First Change"); // Should remain "First Change"
    });

    it('should throw an error if a non-function is passed to $$subscribe', function () {
        const myRef = createRef();
        assert.throws(() => myRef.$$subscribe(null), /Listener must be a function/);
    });
});
