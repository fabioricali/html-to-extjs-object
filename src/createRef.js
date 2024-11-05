function createRef(onChange) {
    let _value = null;

    return new Proxy(
        {$$isRef: true},
        {
            get(target, prop) {
                if (prop === "$$isRef") return target.$$isRef;
                return _value; // Ritorna il valore direttamente su qualsiasi accesso diverso da $$isRef
            },
            set(target, prop, newValue) {
                if (prop !== "$$isRef" && _value !== newValue) {
                    _value = newValue;
                    if (typeof onChange === "function") {
                        onChange(newValue);
                    }
                }
                return true;
            },
        }
    );
}

export default createRef;
