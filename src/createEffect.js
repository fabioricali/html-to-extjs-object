export default function createEffect(effect, dependencies, runInitially = false) {
    if (typeof effect !== "function") {
        throw new Error("Effect must be a function");
    }
    if (!Array.isArray(dependencies) || dependencies.some(dep => typeof dep.$$subscribe !== "function")) {
        throw new Error("Dependencies must be functions with the method $$subscribe");
    }

    // Esegui l'effetto inizialmente se specificato
    if (runInitially) effect();

    // Sottoscrivi le dipendenze e memorizza le funzioni di unsubscribe
    const unsubscribes = dependencies.map(dep => dep.$$subscribe(() => effect()));

    // Restituisci una funzione di cleanup per annullare tutte le sottoscrizioni
    return () => unsubscribes.forEach(unsubscribe => unsubscribe());
}
