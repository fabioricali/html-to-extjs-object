import htm from "htm";
import {createComponentConfig} from "./createComponentConfig.js";
import {detectClassType} from "./detectClassType.js";

export function _h(type, props, ...children) {
    if (type === 'style') {
        return {isStyle: true, content: children[0] || ''}
    } else if (type === 'context') {
        return {isContext: true, props, children: children[0]}
    } else if (typeof type === 'function') {
        return createComponentConfig(detectClassType(type.name), type(props), children, props)
    }
    return createComponentConfig(detectClassType(type), props, children);
}

export function h(strings, ...values) {
    // Parsing standard con HTM
    let parsed = htm.bind(_h)(strings, ...values);

    // Funzione per sostituire i segnaposti negli attributi (props)
    function replaceStatePlaceholders(node) {
        if (node && typeof node === 'object' && node.props) {
            Object.keys(node.props).forEach((key) => {
                const propValue = node.props[key];

                // Se l'attributo è una stringa e contiene un riferimento a uno stato
                if (typeof propValue === 'string') {
                    // Rimpiazza segnaposti all'interno della stringa
                    node.props[key] = propValue.replace(/__STATE__(\w+)/g, (match, stateName) => {
                        const originalValue = values.find(
                            (value) => typeof value === 'function' && value.name === stateName
                        );
                        return originalValue ? originalValue() : match; // Richiama la funzione di stato
                    });
                }
            });
        }
    }

    // Applica la sostituzione dei segnaposti solo sugli attributi
    if (Array.isArray(parsed)) {
        parsed.forEach(replaceStatePlaceholders);
    } else {
        replaceStatePlaceholders(parsed);
    }

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
