import {createState, toggleState} from "../src/index.js";
import assert from "node:assert";

describe('toggleState', function () {
    it('a single state set to false should change using toggleState to true', function () {
        const [myState] = createState(false, null, false, true);
        toggleState(myState);
        assert.equal(myState(), true);
        toggleState(myState);
        assert.equal(myState(), false);
    });

    it('a single state set to false should change using toggleState to true', function () {
        const [{ done, text }, ] = createState({ done: false, text: 'Hello' });
        toggleState(done);
        assert.equal(text(), 'Hello');
        assert.equal(done(), true);
        toggleState(done);
        assert.equal(done(), false);
    });
})