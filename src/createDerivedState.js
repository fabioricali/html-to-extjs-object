import { createState } from "./createState.js";

export default function createDerivedState(sourceStates, transformer, ...args) {
    // Se sourceStates non è un array, lo convertiamo in un array con un solo elemento
    if (!Array.isArray(sourceStates)) {
        sourceStates = [sourceStates];
    }

    const [derived, setDerived] = createState(transformer(...sourceStates.map(s => s()), ...args));

    // Manteniamo un valore interno per tracciare l'ultimo aggiornamento
    const updatedValues = [...sourceStates.map(s => s())];

    // Funzione per calcolare il valore derivato in modo sincronizzato
    const updateDerivedState = () => {
        setDerived(transformer(...updatedValues, ...args));
    };

    // Osserva cambiamenti in tutti gli stati di origine e aggiorna automaticamente quello derivato
    sourceStates.forEach((state, index) => {
        state.$$subscribe((newValue) => {
            updatedValues[index] = newValue;
            updateDerivedState();
        });
    });

    return derived;
}
