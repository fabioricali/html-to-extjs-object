import { setActiveTracker } from './dependencyTracker.js';
import { createState } from './createState.js';

export default function createDerivedState(transformer, sync = false, ...args) {
    const dependencies = new Set();

    const trackingWrapper = (...args) => {
        setActiveTracker(dependencies);
        try {
            return transformer(...args.map(arg => (arg.$$isState ? arg() : arg)));
        } finally {
            setActiveTracker(null);
        }
    };

    const [derived, setDerived] = createState(trackingWrapper(...args), null, false, sync);

    const updateDerivedState = () => {
        if (sync) {
            setDerived(trackingWrapper(...args));
        } else {
            queueMicrotask(() => {
                setDerived(trackingWrapper(...args));
            });
        }
    };

    dependencies.forEach(state => {
        state.$$subscribe(updateDerivedState);
    });

    return derived;
}
