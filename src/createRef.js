function createRef(onChange) {
    let _current = null;

    return {
        $$isRef: true,
        get current() {
            return _current;
        },
        set current(value) {
            _current = value;
            if (typeof onChange === "function") {
                onChange(value);
            }
        },
    };
}

export default createRef