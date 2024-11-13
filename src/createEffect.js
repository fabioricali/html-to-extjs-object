export default function createEffect(effect, dependencies, runInitially = false) {
    if (typeof effect !== "function") {
        throw new Error("Effect must be a function");
    }

    if (!Array.isArray(dependencies)) {
        throw new Error("Dependencies must be an array");
    }

    // Run the effect initially if requested
    if (runInitially) effect();

    const unsubscribes = dependencies.map(dep => {
        if (dep && typeof dep.$$subscribe === "function") {
            // Dependency is a reactive object with $$subscribe method
            return dep.$$subscribe(() => effect());
        } else {
            throw new Error("Dependencies must be objects with the method $$subscribe");
        }
    });

    return () => {
        unsubscribes.forEach(unsubscribe => {
            if (typeof unsubscribe === "function") {
                unsubscribe();
            }
        });
    };
}