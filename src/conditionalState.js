import createDerivedState from "./createDerivedState.js";

export default function conditionalState(state, trueValue, falseValue) {
    return createDerivedState(state, value => value ? trueValue : falseValue);
}