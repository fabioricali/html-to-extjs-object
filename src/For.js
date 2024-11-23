import {h} from "./parser.js";

export function For({ each, effect, getKey = (item) => item.id || item.name, tag }) {
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