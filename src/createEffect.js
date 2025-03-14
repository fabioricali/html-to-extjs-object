export default function createEffect(effect, dependencies, runInitially = false) {
    if (typeof effect !== "function") {
        throw new Error("Effect must be a function");
    }

    if (!Array.isArray(dependencies)) {
        throw new Error("Dependencies must be an array");
    }

    let cleanup; // Variabile per memorizzare il cleanup dell'effetto

    // Funzione per eseguire l'effetto e gestire il cleanup
    const runEffect = () => {
        if (typeof cleanup === "function") {
            cleanup(); // Puliamo prima di eseguire un nuovo effetto
        }
        cleanup = effect(); // Salviamo il cleanup restituito dall'effetto
    };

    // Eseguiamo l'effetto inizialmente se richiesto
    if (runInitially) runEffect();

    const unsubscribes = dependencies.map(dep => {
        if (!dep || typeof dep !== "object" || typeof dep.$$subscribe !== "function") {
            throw new Error("Dependencies must be objects with the method $$subscribe");
        }
        return dep.$$subscribe(runEffect);
    });


    return () => {
        if (typeof cleanup === "function") cleanup(); // Cleanup finale
        unsubscribes.forEach(unsub => unsub?.());
    };
}
