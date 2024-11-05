import {initialize, destroy} from "./defaultListeners.js";
import {generateHtmlClass} from "./generateHtmlClass.js";
import {h} from "./parser.js";
import {createState} from "./createState.js";
import createRef from "./createRef.js";
export {h, generateHtmlClass, initialize, destroy, createState, createRef};

try {
    if (window) {
        generateHtmlClass()
    }
} catch (e) {}