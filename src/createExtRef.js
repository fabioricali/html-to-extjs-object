import createRef from "./createRef.js";

export default function createExtRef(onChange = null) {
    return createRef(onChange, true);
}