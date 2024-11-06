import {initialize, destroy} from "./defaultListeners.js";
import {generateHtmlClass} from "./generateHtmlClass.js";
import {h} from "./parser.js";
import {createState} from "./createState.js";
import createRef from "./createRef.js";
import createEffect from "./createEffect.js";
import createDerivedState from "./createDerivedState.js";
export {h, generateHtmlClass, initialize, destroy, createState, createRef, createEffect, createDerivedState};

try {
    if (window) {
        generateHtmlClass()
    }
} catch (e) {}