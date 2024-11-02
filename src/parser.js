import htm from "htm";
import { createComponentConfig } from "./createComponentConfig.js";
import { detectClassType } from "./detectClassType.js";

export function _h(type, props, ...children) {
    if (type === 'style') {
        return { isStyle: true, content: children[0] || '' };
    } else if (type === 'context') {
        return { isContext: true, props, children: children[0] };
    } else if (typeof type === 'function') {
        return createComponentConfig(detectClassType(type.name), type(props), children, props);
    }
    return createComponentConfig(detectClassType(type), props, children);
}

export function h(strings, ...values) {
    // Preprocessa i valori per sostituire le funzioni di stato con segnaposti
    const processedValues = values.map((value) => {
        if (typeof value === 'function' && value.$$isState) {
            return `__STATE__${value.name}`; // Usa un segnaposto unico per le funzioni di stato
        }
        return value;
    });

    // Parsing standard con HTM usando i segnaposti
    let parsed = htm.bind(_h)(strings, ...processedValues);

    // Funzione per sostituire i segnaposti negli attributi (props)
    function replaceStatePlaceholders(node) {
        if (node && typeof node === 'object') {
            // Controlla se _propsAttributes esiste
            if (node._propsAttributes) {
                // Verifica e sostituisci i segnaposti nelle proprietà
                Object.keys(node._propsAttributes).forEach((key) => {
                    const propValue = node._propsAttributes[key];
                    if (typeof propValue === 'string') {
                        node._propsAttributes[key] = propValue.replace(/__STATE__(\w+)/g, (match, stateName) => {
                            const originalValue = values.find(
                                (value) => typeof value === 'function' && value.name === stateName && value.$$isState
                            );
                            return originalValue ? originalValue() : match; // Richiama la funzione di stato
                        });
                    }
                });
            }

            // Se ci sono elementi figli, iterali
            if (node.items && Array.isArray(node.items)) {
                node.items.forEach(replaceStatePlaceholders);
            }
        }
    }

    // Applica la sostituzione dei segnaposti solo sugli attributi
    replaceStatePlaceholders(parsed);

    // Gestione degli stili, come nel codice originale
    if (parsed.length > 1 && parsed[0].isStyle) {
        let styleContent = parsed[0].content;
        parsed = parsed[1];
        parsed.stylesheet = styleContent;
    }

    // Gestione dei contesti, come nel codice originale
    if (parsed.isContext) {
        parsed.props = parsed.props || {};
        let contextName = parsed.props.name;
        let stylesheet = parsed.stylesheet;
        parsed = parsed.children;
        parsed.stylesheet = stylesheet;
        parsed.contextName = contextName;
        parsed.isContext = true;
    }

    return parsed;
}
