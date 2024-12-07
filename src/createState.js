import { getActiveTracker } from './dependencyTracker.js';

export function createState(initialValue, context = null, treatAsSingleEntity = false, sync = false) {
    const stateCache = createState.stateCache || (createState.stateCache = new WeakMap());

    const getPersistentState = (context, valueInitializer) => {
        if (!stateCache.has(context)) {
            stateCache.set(context, valueInitializer());
        }
        return stateCache.get(context);
    };

    if (context) {
        return getPersistentState(context, () => {
            return createState(initialValue, null, treatAsSingleEntity, sync);
        });
    }

    const isObject = typeof initialValue === 'object' && initialValue !== null && !Array.isArray(initialValue) && !(initialValue instanceof Date) && !treatAsSingleEntity;
    let state = isObject ? { ...initialValue } : initialValue;

    const globalListeners = new Set();
    const propertyListeners = isObject
        ? Object.fromEntries(Object.keys(state).map(key => [key, new Set()]))
        : null;

    let batchUpdates = [];
    let pendingUpdate = false;

    const getState = () => {
        const tracker = getActiveTracker();
        if (tracker) {
            tracker.add(getState);
        }
        return state;
    };

    getState.$$isState = true;
    getState.$$subscribe = listener => {
        globalListeners.add(listener);
        return () => globalListeners.delete(listener);
    };

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
                return new Promise(resolve => {
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

        if (isObject) {
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
            }
        } else {
            if (newValue !== state) {
                state = newValue;
                hasChanges = true;
            }
        }

        if (hasChanges) {
            globalListeners.forEach(listener => listener(state));
        }
    };

    const processBatchUpdates = () => {
        batchUpdates.forEach(newValue => applyState(newValue));
        batchUpdates = [];
    };

    if (isObject) {
        Object.keys(state).forEach(key => {
            setState[key] = (newValue) => {
                const updatedValue = typeof newValue === "function" ? newValue(state[key]) : newValue;

                if (state[key] !== updatedValue) {
                    state = { ...state, [key]: updatedValue };

                    propertyListeners[key].forEach(listener => listener(state[key]));
                    globalListeners.forEach(listener => listener(state));
                }
            };
        });
    }

    const stateGetters = isObject
        ? Object.fromEntries(
            Object.keys(state).map(key => {
                const propertyGetter = () => {
                    const tracker = getActiveTracker();
                    if (tracker) {
                        tracker.add(propertyGetter);
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
