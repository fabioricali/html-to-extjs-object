export default function createPropertyObserver(target, path, callback = null) {
    if (typeof target !== "object" || target === null) {
        throw new Error("Target must be an object");
    }

    const parts = path.split('.');
    let current = target;
    for (let i = 0; i < parts.length - 1; i++) {
        current = current[parts[i]];
        if (typeof current !== "object" || current === null) {
            throw new Error(`Invalid property path: ${path}`);
        }
    }
    const prop = parts[parts.length - 1];

    const listeners = [];
    let value = current[prop];

    Object.defineProperty(current, prop, {
        get() {
            return value;
        },
        set(newValue) {
            value = newValue;
            listeners.forEach(callback => callback());
            if (callback) callback();
        },
        configurable: true,
        enumerable: true,
    });

    return {
        $$subscribe(callback) {
            listeners.push(callback);
            return () => {
                const index = listeners.indexOf(callback);
                if (index !== -1) listeners.splice(index, 1);
            };
        }
    };
}