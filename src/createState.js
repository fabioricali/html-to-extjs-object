export function createState(initialValue) {
    let state = initialValue;
    const listeners = new Set();

    // Funzione per iscriversi ai cambiamenti di stato
    const subscribe = (listener) => {
        listeners.add(listener);
        return () => listeners.delete(listener); // Ritorna una funzione per rimuovere l'observer
    };
    // Funzione getter che restituisce un oggetto con valore e tipo
    const getState = () => state;
    getState.$$isState = true; // Aggiunge la proprietà isState direttamente alla funzione
    getState.$$subscribe = subscribe;

    // Funzione setter
    const setState = (newValue) => {
        if (newValue !== state) {
            state = newValue;
            listeners.forEach((listener) => listener(state));
        }
    };

    return [getState, setState, subscribe]; // Ritorniamo anche subscribe
}