function createRef(onChange) {
    let _current = null;

    return {
        $$isRef: true,  // Proprietà speciale per identificare l'oggetto come ref

        get current() {
            return _current;
        },
        set current(value) {
            if (_current !== value) {
                _current = value;
                //console.log("Valore impostato:", _current);  // Log per debug
                if (typeof onChange === "function") {
                    onChange(value);
                }
            }
        },
    };
}

export default createRef;
