export default function createEffect(effect, dependencies, runInitially = false) {
    if (typeof effect !== "function") {
        throw new Error("Effect must be a function");
    }

    if (!Array.isArray(dependencies)) {
        throw new Error("Dependencies must be an array");
    }

    // Run the effect initially if requested
    if (runInitially) effect();

    const proxies = [];
    const unsubscribes = dependencies.map(dep => {
        if (dep && typeof dep.$$subscribe === "function") {
            // Dependency is a reactive object with $$subscribe method
            return dep.$$subscribe(() => effect());
        } else if (typeof dep === "object" && dep !== null) {
            // Dependency is a common object, watch its properties (including nested)
            const handler = {
                set(target, property, value) {
                    if (typeof value === 'object' && value !== null) {
                        target[property] = createProxy(value, handler);
                    } else {
                        target[property] = value;
                    }
                    effect();
                    return true;
                }
            };
            const proxy = createProxy(dep, handler);
            proxies.push(proxy);
            return null;
        } else if (typeof dep === "string" && dep.includes('.')) {
            // Dependency is a property path (e.g., 'myApp.USER_CONFIG')
            const [root, ...path] = dep.split('.');
            let target = globalThis[root];
            for (let i = 0; i < path.length - 1; i++) {
                target = target[path[i]];
                if (typeof target !== "object" || target === null) {
                    throw new Error("Invalid property path");
                }
            }
            const prop = path[path.length - 1];
            let originalValue = target[prop];
            Object.defineProperty(target, prop, {
                get() {
                    return originalValue;
                },
                set(newValue) {
                    originalValue = newValue;
                    effect();
                },
                configurable: true,
                enumerable: true,
            });
            return () => {
                // Restore original property descriptor (optional clean-up)
                Object.defineProperty(target, prop, {
                    value: originalValue,
                    writable: true,
                    configurable: true,
                    enumerable: true,
                });
            };
        } else {
            throw new Error("Dependencies must be objects, functions with the method $$subscribe, or valid property paths");
        }
    });

    return () => {
        unsubscribes.forEach(unsubscribe => {
            if (typeof unsubscribe === "function") {
                unsubscribe();
            }
        });
        return proxies.length > 0 ? proxies : undefined;
    };
}

function createProxy(target, handler) {
    const proxy = new Proxy(target, handler);
    // Recursively proxy nested objects
    for (const key of Object.keys(target)) {
        if (typeof target[key] === 'object' && target[key] !== null) {
            target[key] = createProxy(target[key], handler);
        }
    }
    return proxy;
}