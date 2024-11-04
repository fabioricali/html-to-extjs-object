import {initialize, destroy} from "./defaultListeners.js";
import {generateHtmlClass} from "./generateHtmlClass.js";
import {h} from "./parser.js";
import {createState} from "./createState.js";
export {h, generateHtmlClass, initialize, destroy, createState};

try {
    if (window) {
        generateHtmlClass()
    }
} catch (e) {}