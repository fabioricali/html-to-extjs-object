import htm from 'htm'
const STYLE_PREFIX = 'extml-style-'


export function isListener(prop) {
    return prop.startsWith('on')
}

export function extractListenerName(prop) {
    return prop.substring(2)
}

export function composeStyleInner(cssContent, tag) {
    if (typeof cssContent !== 'string')
        return;
    //cssContent = mapper.getAll(cssContent);
    let sanitizeTagForAnimation = tag.replace(/\w/g, '');

    cssContent = cssContent
        .replace(/<\/?style>/g, '')
        .replace(/{/g, '{\n')
        .replace(/}/g, '}\n')
        .replace(/^(\s+)?:(component)(\s+)?{/gm, tag + ' {')
        .replace(/:(component)/g, '')
        .replace(/(@(?:[\w-]+-)?keyframes\s+)([\w-_]+)/g, `$1 ${sanitizeTagForAnimation}-$2`)
        .replace(/((?:[\w-]+-)?animation(?:-name)?(?:\s+)?:(?:\s+))([\w-_]+)/g, `$1 ${sanitizeTagForAnimation}-$2`)
        // Remove comments
        .replace(/\/\*[\s\S]*?\*\/|([^:]|^)\/\/.*$/gm, '')
        .replace(/\S.*{/gm, match => {
            if (/^(@|:host|(from|to|\d+%)[^-_])/.test(match))
                return match;
            let part = match.split(',');
            const sameTag = new RegExp(`^${tag.replace(/[[\]]/g, '\\$&')}(\\s+)?{`);
            for (let i = 0; i < part.length; i++) {
                part[i] = part[i].trim();
                if (sameTag.test(part[i]))
                    continue;
                if (/^:global/.test(part[i]))
                    part[i] = part[i].replace(':global', '');
                else
                    part[i] = `${tag} ${part[i]}`;
            }
            match = part.join(',');
            return match;
        });
    cssContent = cssContent
        .replace(/\s{2,}/g, ' ')
        .replace(/{ /g, '{')
        .replace(/ }/g, '}')
        .replace(/\s:/g, ':') //remove space before pseudo classes
        .replace(/\n/g, '')
        .trim();
    return cssContent;
}

export function createStyle() {
    if (!this.stylesheet) return;
    let id = this.getId();
    let styleElement = document.createElement('style');
    styleElement.id = STYLE_PREFIX + id;
    styleElement.innerHTML = composeStyleInner(this.stylesheet, '#' + id);
    document.head.appendChild(styleElement);
}

export function destroyStyle() {
    if (!this.stylesheet) return;
    document.getElementById(STYLE_PREFIX + this.getId()).remove();
}

export function createEventObject(name, handle) {
    let event = {}
    event[name] = handle;
    return event;
}

export function addEvent(componentConfig, eventObject) {
    componentConfig.listeners.push(eventObject);
}

function createComponentConfig(type, props, children, propsFunction) {
    let componentConfig = {
        xtype: type.toLowerCase(),
        listeners: [
            createEventObject('initialize', createStyle),
            createEventObject('destroy', destroyStyle)
        ]
    };

    props = Object.assign({}, props, propsFunction);

    for (let prop in props) {
        if (isListener(prop)) {
            addEvent(
                componentConfig,
                createEventObject(extractListenerName(prop), props[prop])
            )
        } else {
            componentConfig[prop] = props[prop];
        }
    }

    children.forEach(child => {
        if (typeof child === 'string') {
            if (!componentConfig.html)
                componentConfig.html = '';
            componentConfig.html += child
        } else {
            if (!componentConfig.items)
                componentConfig.items = [];
            componentConfig.items.push(child)
        }
    })

    return componentConfig
}

function _h(type, props, ...children) {
    if (typeof type === 'function') {
        return createComponentConfig(type.name, type(props), children, props)
    }
    return createComponentConfig(type, props, children);
}
//console.dir(htm)
export const h = htm.bind(_h);
