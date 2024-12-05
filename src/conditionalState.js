import createDerivedState from "./createDerivedState.js";

export default function conditionalState(state, trueValue = true, falseValue = false) {
    return createDerivedState(state, value => value ? trueValue : falseValue);
}