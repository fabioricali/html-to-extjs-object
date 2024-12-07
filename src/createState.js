export function createState(initialValue, context = null, treatAsSingleEntity = false, sync = false) {
    // Aggiunto stateCache per la persistenza opzionale
    const stateCache = createState.stateCache || (createState.stateCache = new WeakMap());

    // Helper per la gestione della persistenza
    const getPersistentState = (context, valueInitializer) => {
        if (!stateCache.has(context)) {
            stateCache.set(context, valueInitializer());
        }
        return stateCache.get(context);
    };

    // Gestione della persistenza tramite contesto
    if (context) {
        return getPersistentState(context, () => {
            return createState(initialValue, null, treatAsSingleEntity, sync);
        });
    }

    // Determinazione del tipo di stato iniziale
    const isObject = typeof initialValue === 'object' && initialValue !== null && !Array.isArray(initialValue) && !(initialValue instanceof Date) && !treatAsSingleEntity;
    let state = isObject ? { ...initialValue } : initialValue;

    // Inizializzazione dei listener globali e per proprietà (se oggetto)
    const globalListeners = new Set();
    const propertyListeners = isObject
        ? Object.fromEntries(Object.keys(state).map(key => [key, new Set()]))
        : null;

    // Variabili per il batching
    let batchUpdates = [];
    let pendingUpdate = false;

    // Funzione per ottenere lo stato corrente (aggiunge tracking se attivo)
    const getState = () => {
        if (createState.activeTracker) {
            createState.activeTracker.add(getState);
        }
        return state;
    };

    getState.$$isState = true;
    getState.$$subscribe = listener => {
        globalListeners.add(listener);
        return () => globalListeners.delete(listener);
    };

    // Funzione per aggiornare lo stato
    const setState = (newValue) => {
        if (typeof newValue === 'function') {
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

    // Funzione per applicare un nuovo stato
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

                    // Notifica i listener per proprietà specifiche
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

    // Funzione per processare gli aggiornamenti batch
    const processBatchUpdates = () => {
        batchUpdates.forEach(newValue => applyState(newValue));
        batchUpdates = [];
    };

    // Helper per confrontare array
    const arraysEqual = (a, b) => Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((val, index) => val === b[index]);

    // Getter per proprietà (se oggetto)
    const stateGetters = isObject
        ? Object.fromEntries(
            Object.keys(state).map(key => {
                const propertyGetter = () => {
                    if (createState.activeTracker) {
                        createState.activeTracker.add(propertyGetter);
                    }
                    return state[key];
                };
                propertyGetter.$$isState = true;
                propertyGetter.$$subscribe = listener => {
                    propertyListeners[key].add(listener);
                    return () => propertyListeners[key].delete(listener);
                };
                return [key, propertyGetter];
            })
        )
        : getState;

    return [isObject ? stateGetters : getState, setState, getState.$$subscribe];
}

// Variabile globale per il tracking delle dipendenze
createState.activeTracker = null;
