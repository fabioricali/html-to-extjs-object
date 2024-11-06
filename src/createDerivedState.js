import {createState} from "./createState.js";

export default function createDerivedState(sourceState, transformer, ...args) {
    const [derived, setDerived] = createState(transformer(sourceState(), ...args));

    // Osserva cambiamenti nello stato di origine e aggiorna automaticamente quello derivato
    sourceState.$$subscribe((newValue) => {
        setDerived(transformer(newValue, ...args));
    });

    return derived;
}