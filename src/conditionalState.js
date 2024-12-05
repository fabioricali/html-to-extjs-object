import createDerivedState from "./createDerivedState.js";

export default function conditionalState(state, trueValue = true, falseValue = false) {
    return createDerivedState(value => value ? trueValue : falseValue, state);
}