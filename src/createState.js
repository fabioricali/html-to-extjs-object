export function createState(initialValue, context = null, treatAsSingleEntity = false, sync = false) {
    // Aggiunto stateCache per la persistenza opzionale
    const stateCache = createState.stateCache || (createState.stateCache = new WeakMap());

    // Helper per gestire la persistenza opzionale
    const getPersistentState = (context, valueInitializer) => {
        if (!stateCache.has(context)) {
            stateCache.set(context, valueInitializer());
        }
        return stateCache.get(context);
    };

    // Gestione della persistenza
    if (context) {
        return getPersistentState(context, () => {
            return createState(initialValue, null, treatAsSingleEntity, sync);
        });
    }

    let isObject = typeof initialValue === 'object' && initialValue !== null && !Array.isArray(initialValue) && !(initialValue instanceof Date) && !treatAsSingleEntity;
    let state = isObject ? { ...initialValue } : initialValue;
    const globalListeners = new Set();
    const propertyListeners = isObject
        ? Object.fromEntries(Object.keys(state).map(key => [key, new Set()]))
        : null;

    let pendingUpdate = false;
    let batchUpdates = [];

    const subscribe = (listener) => {
        globalListeners.add(listener);
        return () => globalListeners.delete(listener);
    };

    const getState = () => state;
    getState.$$isState = true;
    getState.$$subscribe = subscribe;

    const setState = (newValue) => {
        if (typeof newValue === "function") {
            newValue = newValue(state);
        }

        if (sync) {
            applyState(newValue);
            return Promise.resolve();
        } else {
            batchUpdates.push(newValue);
            if (!pendingUpdate) {
                pendingUpdate = true;
                return new Promise((resolve) => {
                    queueMicrotask(() => {
                        pendingUpdate = false;
                        processBatchUpdates();
                        resolve();
                    });
                });
            } else {
                return Promise.resolve();
            }
        }
    };

    const applyState = (newValue) => {
        let hasChanges = false;

        if (Array.isArray(initialValue)) {
            if (!arraysEqual(state, newValue)) {
                state = [...newValue];
                hasChanges = true;
            }
        } else if (initialValue instanceof Date) {
            if (state.getTime() !== newValue.getTime()) {
                state = new Date(newValue);
                hasChanges = true;
            }
        } else if (isObject) {
            const newState = { ...state };

            Object.keys(newValue).forEach(key => {
                if (newValue[key] !== state[key]) {
                    newState[key] = newValue[key];
                    hasChanges = true;

                    // Notifica i listener per la singola proprietà
                    propertyListeners[key].forEach(listener => listener(newState[key]));
                }
            });

            if (hasChanges) {
                state = newState;
            }
        } else {
            if (newValue !== state) {
                state = newValue;
                hasChanges = true;
            }
        }

        if (hasChanges) {
            // Notifica i listener globali
            globalListeners.forEach(listener => listener(state));
        }
    };

    const processBatchUpdates = () => {
        batchUpdates.forEach(newValue => applyState(newValue));
        batchUpdates = [];
    };

    // Creazione di setter specifici per ogni proprietà
    if (isObject) {
        Object.keys(state).forEach(key => {
            setState[key] = (newValue) => {
                if (state[key] !== newValue) {
                    state = { ...state, [key]: newValue };

                    // Notifica i listener della proprietà specifica
                    propertyListeners[key].forEach(listener => listener(state[key]));

                    // Notifica i listener globali
                    globalListeners.forEach(listener => listener(state));
                }
            };
        });
    }

    const arraysEqual = (a, b) => Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((val, index) => val === b[index]);

    const stateGetters = isObject
        ? Object.fromEntries(
            Object.keys(state).map(key => {
                const propertyGetter = () => state[key];
                propertyGetter.$$isState = true;
                propertyGetter.$$subscribe = listener => {
                    propertyListeners[key].add(listener);
                    return () => propertyListeners[key].delete(listener);
                };
                return [key, propertyGetter];
            })
        )
        : getState;

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