import {initialize, destroy} from "./defaultListeners.js";
import {generateHtmlClass, defineExtClass} from "./generateHtmlClass.js";
import {h} from "./parser.js";
import {createState} from "./createState.js";
import createRef from "./createRef.js";
import createExtRef from "./createExtRef.js";
import createEffect from "./createEffect.js";
import createPropertyObserver from "./createPropertyObserver.js";
import {createDerivedState} from "./createDerivedState.js";
import conditionalState from "./conditionalState.js";
import {For} from "./For.js";
export {
    h, generateHtmlClass, initialize, destroy, createState, createRef, createExtRef, createEffect, createDerivedState,
    defineExtClass, createPropertyObserver, For, conditionalState
};

try {
    if (window) {
        generateHtmlClass()
    }
} catch (e) {}