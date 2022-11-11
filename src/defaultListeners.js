import {createStyle, destroyStyle} from "./style.js";
import {createContext} from "./context.js";

export function initialize() {
    createStyle.apply(this);
    createContext.apply(this);
}

export function destroy() {
    destroyStyle.apply(this)
}
