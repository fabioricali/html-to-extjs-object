import {h} from "./parser.js";

export function For({each, func}) {
    function onInitialize(component) {
        console.log(each);
        console.log(func)
        component.add(func())
    }

    return h`<ext-container oninitialize="${onInitialize}"></ext-container>`
}