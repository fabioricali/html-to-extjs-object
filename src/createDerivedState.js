import { createState } from "./createState.js";

// Variabile globale per il tracking delle dipendenze
let activeTracker = null;

// Wrapper per tracciare l'accesso agli stati
function trackDependency(state) {
    if (activeTracker) {
        activeTracker.add(state);
    }
    return state();
}

export default function createDerivedState(transformer, sync = false, ...args) {
    const dependencies = new Set();

    // Wrapper per intercettare l'accesso agli stati
    const trackingWrapper = (...args) => {
        activeTracker = dependencies;
        try {
            return transformer(...args.map(arg => (arg.$$isState ? trackDependency(arg) : arg)));
        } finally {
            activeTracker = null;
        }
    };

    // Esegui il transformer iniziale per raccogliere le dipendenze
    const [derived, setDerived] = createState(trackingWrapper(...args), null, false, sync);

    const updatedValues = new Map();
    let pendingUpdate = false;

    const updateDerivedState = () => {
        if (sync) {
            setDerived(trackingWrapper(...args));
        } else {
            if (!pendingUpdate) {
                pendingUpdate = true;
                queueMicrotask(() => {
                    pendingUpdate = false;
                    setDerived(trackingWrapper(...args));
                });
            }
        }
    };

    // Aggiungi listener alle dipendenze
    dependencies.forEach((state) => {
        updatedValues.set(state, state());
        state.$$subscribe((newValue) => {
            updatedValues.set(state, newValue);
            updateDerivedState();
        });
    });

    return derived;
}