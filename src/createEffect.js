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
            // Dependency is a common object, watch its properties
            const handler = {
                set(target, property, value) {
                    target[property] = value;
                    effect();
                    return true;
                }
            };
            const proxy = createProxy(dep, handler);
            proxies.push(proxy);
            return null;
        } else {
            throw new Error("Dependencies must be objects or functions with the method $$subscribe");
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
    return new Proxy(target, handler);
}