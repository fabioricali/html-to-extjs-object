function createRef(onChange) {
    let _value = null;

    const ref = {
        $$isRef: true,
    };

    return new Proxy(ref, {
        get(target, prop) {
            // Se accedi a $$isRef, restituisci quella proprietà
            if (prop === "$$isRef") return target.$$isRef;
            // Altrimenti, restituisci _value come valore "predefinito"
            return _value;
        },
        set(target, prop, newValue) {
            // Imposta _value direttamente come valore "predefinito"
            if (prop !== "$$isRef" && _value !== newValue) {
                _value = newValue;
                if (typeof onChange === "function") {
                    onChange(newValue);
                }
            }
            return true;
        },
    });
}

export default createRef;
