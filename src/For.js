import {h} from "./parser.js";

export function For({ each, effect, getKey = (item) => item.id || item.name }) {
    function onInitialize(component) {
        const childStateMap = new Map(); // Mappa per gestire lo stato dei figli

        const updateChildren = (newItems) => {
            const newStateMap = new Map(); // Nuova mappa per gli stati aggiornati

            // Rigenera sempre tutti gli elementi
            newItems.forEach((item, index) => {
                const key = getKey(item); // Ottieni una chiave univoca per ogni elemento
                const state = childStateMap.get(key) || {};
                newStateMap.set(key, state);

                const child = effect(item, index, state); // Genera il figlio
                if (component.items.getAt(index)) {
                    component.removeAt(index);
                    component.insert(index, child);
                } else {
                    component.add(child);
                }
            });

            // Rimuove eventuali elementi extra
            while (component.items.length > newItems.length) {
                component.removeAt(component.items.length - 1);
            }

            // Aggiorna la mappa degli stati
            childStateMap.clear();
            for (const [key, value] of newStateMap.entries()) {
                childStateMap.set(key, value);
            }
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
// function deepEqual(a, b) {
//     if (a === b) return true;
//
//     if (typeof a === 'object' && typeof b === 'object' && a !== null && b !== null) {
//         const keysA = Object.keys(a);
//         const keysB = Object.keys(b);
//
//         if (keysA.length !== keysB.length) return false;
//
//         return keysA.every(key => deepEqual(a[key], b[key]));
//     }
//
//     return false;
// }

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
