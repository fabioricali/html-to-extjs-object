import {initialize, destroy} from "./defaultListeners.js";
import {generateHtmlClass, defineExtClass} from "./generateHtmlClass.js";
import {h} from "./parser.js";
import {createState} from "./createState.js";
import createRef from "./createRef.js";
import createEffect from "./createEffect.js";
import createPropertyObserver from "./createPropertyObserver.js";
import createDerivedState from "./createDerivedState.js";
import {For} from "./For.js";
export {h, generateHtmlClass, initialize, destroy, createState, createRef, createEffect, createDerivedState, defineExtClass, createPropertyObserver, For};

try {
    if (window) {
        generateHtmlClass()
    }
} catch (e) {}