export function createState(initialValue, treatAsSingleEntity = false) {
    let isObject = typeof initialValue === 'object' && initialValue !== null && !Array.isArray(initialValue) && !(initialValue instanceof Date) && !treatAsSingleEntity;
    let state = isObject ? { ...initialValue } : initialValue;
    const globalListeners = new Set();

    // Crea un set di listener per ogni proprietà se lo stato è un oggetto
    const propertyListeners = isObject
        ? Object.fromEntries(Object.keys(state).map(key => [key, new Set()]))
        : null;

    // Funzione per iscriversi ai cambiamenti globali di stato
    const subscribe = (listener) => {
        globalListeners.add(listener);
        return () => globalListeners.delete(listener); // Ritorna una funzione per rimuovere l'observer globale
    };

    // Funzione getter generale
    const getState = () => state;
    getState.$$isState = true;
    getState.$$subscribe = subscribe;

    // Creazione di getter e setter specifici per ogni proprietà
    const stateGetters = isObject
        ? Object.fromEntries(
            Object.keys(state).map((key) => {
                const propertyGetter = () => state[key];
                propertyGetter.$$isState = true;

                // Subscribe specifico per la proprietà
                propertyGetter.$$subscribe = (listener) => {
                    propertyListeners[key].add(listener);
                    return () => propertyListeners[key].delete(listener); // Rimuove l'observer della proprietà
                };

                return [key, propertyGetter];
            })
        )
        : getState;

    // Funzione setter generale per aggiornare lo stato
    const setState = (newValue) => {
        if (Array.isArray(initialValue)) {
            if (!arraysEqual(state, newValue)) {
                state = [...newValue];
                globalListeners.forEach((listener) => listener(state));
            }
        } else if (initialValue instanceof Date) {
            if (state.getTime() !== newValue.getTime()) {
                state = new Date(newValue);
                globalListeners.forEach((listener) => listener(state));
            }
        } else if (isObject) {
            let hasChanges = false;
            const newState = { ...state };

            Object.keys(newValue).forEach((key) => {
                if (newValue[key] !== state[key]) {
                    newState[key] = newValue[key];
                    hasChanges = true;
                    // Notifica solo i listener della proprietà specifica
                    propertyListeners[key].forEach((listener) => listener(newState[key]));
                }
            });

            if (hasChanges) {
                state = newState;
                globalListeners.forEach((listener) => listener(state));
            }
        } else {
            if (newValue !== state) {
                state = newValue;
                globalListeners.forEach((listener) => listener(state));
            }
        }
    };

    // Funzione di utilità per confrontare array
    const arraysEqual = (a, b) => Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((val, index) => val === b[index]);

    // Creazione di setter specifici per ogni proprietà
    if (isObject) {
        Object.keys(state).forEach((key) => {
            setState[key] = (newValue) => {
                if (state[key] !== newValue) {
                    state = { ...state, [key]: newValue };
                    // Notifica solo i listener della proprietà specifica
                    propertyListeners[key].forEach((listener) => listener(state[key]));
                    // Notifica i listener globali dell'intero stato aggiornato
                    globalListeners.forEach((listener) => listener(state));
                }
            };
        });
    }

    return [isObject ? stateGetters : getState, setState, subscribe];
}


// export function createState(initialValue) {
//     let state = initialValue;
//     const listeners = new Set();
//
//     // Funzione per iscriversi ai cambiamenti di stato
//     const subscribe = (listener) => {
//         listeners.add(listener);
//         return () => listeners.delete(listener); // Ritorna una funzione per rimuovere l'observer
//     };
//     // Funzione getter che restituisce un oggetto con valore e tipo
//     const getState = () => state;
//     getState.$$isState = true; // Aggiunge la proprietà isState direttamente alla funzione
//     getState.$$subscribe = subscribe;
//
//     // Funzione setter
//     const setState = (newValue) => {
//         if (newValue !== state) {
//             state = newValue;
//             listeners.forEach((listener) => listener(state));
//         }
//     };
//
//     return [getState, setState, subscribe]; // Ritorniamo anche subscribe
// }