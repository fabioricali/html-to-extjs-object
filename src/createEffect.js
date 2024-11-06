export default function createEffect(effect, dependencies, runInitially = false) {
    if (typeof effect !== "function") {
        throw new Error("Effect must be a function");
    }
    if (!Array.isArray(dependencies) || dependencies.some(dep => !dep || typeof dep.$$subscribe !== "function")) {
        throw new Error("Dependencies must be functions with the method $$subscribe");
    }

    if (runInitially) effect();

    const unsubscribes = dependencies.map(dep => dep.$$subscribe(() => effect()));

    return () => unsubscribes.forEach(unsubscribe => unsubscribe());
}
