function createRef(onChange = null, isExtRef = false) {
    let _current = null;
    const subscribers = [];

    const ref = function(value) {
        if (arguments.length === 0) {
            // Getter
            return _current;
        } else {
            // Setter
            if (_current !== value) {
                _current = value;
                if (typeof onChange === "function") {
                    onChange(value);
                }
                // Notifica tutti i subscriber del cambiamento
                subscribers.forEach(callback => callback(value));
            }
        }
    };

    // Proprietà speciale per identificare l'oggetto come ref
    ref.$$isRef = true;
    ref.$$isExtRef = isExtRef;

    // Metodo per aggiungere subscriber
    ref.$$subscribe = function(listener) {
        if (typeof listener === "function") {
            subscribers.push(listener);
            return () => {
                // Restituisci una funzione di unsubscribe
                const index = subscribers.indexOf(listener);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
            };
        }
        throw new Error("Listener must be a function");
    };

    return ref;
}

export default createRef;
