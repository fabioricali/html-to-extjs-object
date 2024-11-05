function createRef(onChange) {
    let _value = null;

    function ref(value) {
        if (arguments.length === 0) {
            // Se non viene passato nessun valore, ritorna il valore corrente
            return _value;
        } else if (_value !== value) {
            // Aggiorna solo se il valore cambia
            _value = value;
            if (typeof onChange === "function") {
                onChange(value);
            }
        }
    }

    ref.$$isRef = true;

    return ref;
}

export default createRef;
