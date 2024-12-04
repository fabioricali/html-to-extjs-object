import { createState } from "./createState.js";

export default function createDerivedState(sourceStates, transformer, ...args) {
    // Se sourceStates non è un array, lo convertiamo in un array con un solo elemento
    if (!Array.isArray(sourceStates)) {
        sourceStates = [sourceStates];
    }

    const initialValues = sourceStates.map(state => state());
    const [derived, setDerived] = createState(transformer(...initialValues, ...args));

    // Inizializza e notifica il valore derivato per la prima volta
    setDerived(transformer(...initialValues, ...args));

    // Osserva cambiamenti in tutti gli stati di origine e aggiorna automaticamente quello derivato
    sourceStates.forEach(state => {
        state.$$subscribe(() => {
            const updatedValues = sourceStates.map(s => s());
            setDerived(transformer(...updatedValues, ...args));
        });
    });

    return derived;
}
