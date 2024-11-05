import {initialize, destroy} from "./defaultListeners.js";
import {generateHtmlClass} from "./generateHtmlClass.js";
import {h} from "./parser.js";
import {createState} from "./createState.js";
import createRef from "./createRef.js";
import createEffect from "./createEffect.js";
export {h, generateHtmlClass, initialize, destroy, createState, createRef, createEffect};

try {
    if (window) {
        generateHtmlClass()
    }
} catch (e) {}