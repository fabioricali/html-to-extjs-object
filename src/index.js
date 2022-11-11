import {initialize, destroy} from "./defaultListeners.js";
import {generateHtmlClass} from "./generateHtmlClass.js";
import {h} from "./parser.js";
export {h, generateHtmlClass, initialize, destroy};

try {
    if (window) {
        generateHtmlClass()
    }
} catch (e) {}