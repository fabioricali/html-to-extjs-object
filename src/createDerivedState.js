import { createState } from "./createState.js";

export default function createDerivedState(sourceStates, transformer, sync = false, ...args) {
    // Se sourceStates non è un array, lo convertiamo in un array con un solo elemento
    if (!Array.isArray(sourceStates)) {
        sourceStates = [sourceStates];
    }

    // Creiamo lo stato derivato iniziale
    const [derived, setDerived] = createState(transformer(...sourceStates.map(s => s()), ...args), null, false, sync);

    // Manteniamo un valore interno per tracciare l'ultimo aggiornamento
    const updatedValues = [...sourceStates.map(s => s())];

    // Flag per evitare aggiornamenti multipli durante il batch
    let pendingUpdate = false;

    // Funzione per calcolare il valore derivato in modo sincronizzato o batchato
    const updateDerivedState = () => {
        if (sync) {
            setDerived(transformer(...updatedValues, ...args));
        } else {
            if (!pendingUpdate) {
                pendingUpdate = true;
                queueMicrotask(() => {
                    pendingUpdate = false;
                    setDerived(transformer(...updatedValues, ...args));
                });
            }
        }
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
