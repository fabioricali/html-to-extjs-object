const stateCache = new WeakMap(); // Cache globale per stati persistenti

export function createState(initialValue, context = null, treatAsSingleEntity = false) {
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
            return createState(initialValue, null, treatAsSingleEntity);
        });
    }

    // Logica standard per creare lo stato
    let isObject = typeof initialValue === 'object' && initialValue !== null && !Array.isArray(initialValue) && !(initialValue instanceof Date) && !treatAsSingleEntity;
    let state = isObject ? { ...initialValue } : initialValue;
    const globalListeners = new Set();
    const propertyListeners = isObject
        ? Object.fromEntries(Object.keys(state).map(key => [key, new Set()]))
        : null;

    const subscribe = (listener) => {
        globalListeners.add(listener);
        return () => globalListeners.delete(listener);
    };

    const getState = () => state;
    getState.$$isState = true;
    getState.$$subscribe = subscribe;

    const setState = (newValue) => {
        if (Array.isArray(initialValue)) {
            if (!arraysEqual(state, newValue)) {
                state = [...newValue];
                globalListeners.forEach(listener => listener(state));
            }
        } else if (initialValue instanceof Date) {
            if (state.getTime() !== newValue.getTime()) {
                state = new Date(newValue);
                globalListeners.forEach(listener => listener(state));
            }
        } else if (isObject) {
            let hasChanges = false;
            const newState = { ...state };

            Object.keys(newValue).forEach(key => {
                if (newValue[key] !== state[key]) {
                    newState[key] = newValue[key];
                    hasChanges = true;
                    propertyListeners[key].forEach(listener => listener(newState[key]));
                }
            });

            if (hasChanges) {
                state = newState;
                globalListeners.forEach(listener => listener(state));
            }
        } else {
            if (newValue !== state) {
                state = newValue;
                globalListeners.forEach(listener => listener(state));
            }
        }
    };

    // Creazione di setter specifici per ogni proprietà
    if (isObject) {
        Object.keys(state).forEach(key => {
            setState[key] = (newValue) => {
                if (state[key] !== newValue) {
                    state = { ...state, [key]: newValue };
                    propertyListeners[key].forEach(listener => listener(state[key]));
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