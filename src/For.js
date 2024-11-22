import {h} from "./parser.js";

export function For({ each, effect }) {
    function onInitialize(component) {
        let currentItems = [];
        const childStateMap = new Map(); // Mappa per gestire lo stato dei figli

        const updateChildren = (newItems) => {
            newItems.forEach((item, index) => {
                let child;

                // Inizializza uno stato locale per il figlio, se non esiste
                if (!childStateMap.has(index)) {
                    childStateMap.set(index, {});
                }
                const state = childStateMap.get(index);

                if (!currentItems[index] || !deepEqual(currentItems[index], item)) {
                    // Genera il figlio utilizzando l'effetto
                    child = effect(item, index, state);

                    if (component.items.getAt(index)) {
                        component.removeAt(index);
                        component.insert(index, child);
                    } else {
                        component.add(child);
                    }
                }
            });

            // Rimuove i componenti extra e pulisce gli stati
            while (component.items.length > newItems.length) {
                const removedIndex = component.items.length - 1;
                component.removeAt(removedIndex);
                childStateMap.delete(removedIndex);
            }

            currentItems = newItems;
        };

        if (Array.isArray(each)) {
            updateChildren(each);
        } else {
            updateChildren(each());
            if (each.$$isState) {
                each.$$subscribe(updateChildren);
            }
        }
    }

    return h`<ext-container oninitialize="${onInitialize}"></ext-container>`;
}


// Utility function for deep comparison
function deepEqual(a, b) {
    if (a === b) return true;

    if (typeof a === 'object' && typeof b === 'object' && a !== null && b !== null) {
        const keysA = Object.keys(a);
        const keysB = Object.keys(b);

        if (keysA.length !== keysB.length) return false;

        return keysA.every(key => deepEqual(a[key], b[key]));
    }

    return false;
}

// export function For({ each, func }) {
//     function onInitialize(component) {
//         // Aggiunge dinamicamente i figli generati da func() in base a `each`
//         each().forEach((item, index) => {
//             const child = func(item, index); // Genera il contenuto per ogni elemento
//             component.add(child);
//         });
//
//         // Iscrivi un listener per aggiornare i contenuti se `each` è uno stato reattivo
//         if (each.$$isState) {
//             each.$$subscribe((newItems) => {
//                 component.removeAll(); // Rimuove i componenti precedenti
//                 newItems.forEach((item, index) => {
//                     const child = func(item, index);
//                     component.add(child);
//                 });
//             });
//         }
//     }
//
//     return h`<ext-container oninitialize="${onInitialize}"></ext-container>`;
// }
