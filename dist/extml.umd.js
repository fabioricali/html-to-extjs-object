/* Extml, version: 1.2.1 - October 29, 2022 16:38:45 */
(function(g,f){typeof exports==='object'&&typeof module!=='undefined'?f(exports):typeof define==='function'&&define.amd?define(['exports'],f):(g=typeof globalThis!=='undefined'?globalThis:g||self,f(g.extml={}));})(this,(function(exports){'use strict';var n=function(t,s,r,e){var u;s[0]=0;for(var h=1;h<s.length;h++){var p=s[h++],a=s[h]?(s[0]|=p?1:2,r[s[h++]]):s[++h];3===p?e[0]=a:4===p?e[1]=Object.assign(e[1]||{},a):5===p?(e[1]=e[1]||{})[s[++h]]=a:6===p?e[1][s[++h]]+=a+"":p?(u=t.apply(a,n(t,a,r,["",null])),e.push(u),a[0]?s[0]|=2:(s[h-2]=0,s[h]=u)):e.push(a);}return e},t=new Map;function htm(s){var r=t.get(this);return r||(r=new Map,t.set(this,r)),(r=n(this,r.get(s)||(r.set(s,r=function(n){for(var t,s,r=1,e="",u="",h=[0],p=function(n){1===r&&(n||(e=e.replace(/^\s*\n\s*|\s*\n\s*$/g,"")))?h.push(0,n,e):3===r&&(n||e)?(h.push(3,n,e),r=2):2===r&&"..."===e&&n?h.push(4,n,0):2===r&&e&&!n?h.push(5,0,!0,e):r>=5&&((e||!n&&5===r)&&(h.push(r,0,e,s),r=6),n&&(h.push(r,n,0,s),r=6)),e="";},a=0;a<n.length;a++){a&&(1===r&&p(),p(a));for(var l=0;l<n[a].length;l++)t=n[a][l],1===r?"<"===t?(p(),h=[h],r=3):e+=t:4===r?"--"===e&&">"===t?(r=1,e=""):e=t+e[0]:u?t===u?u="":e+=t:'"'===t||"'"===t?u=t:">"===t?(p(),r=1):r&&("="===t?(r=5,s=e,e=""):"/"===t&&(r<5||">"===n[a][l+1])?(p(),3===r&&(h=h[0]),r=h,(h=h[0]).push(2,0,r),r=0):" "===t||"\t"===t||"\n"===t||"\r"===t?(p(),r=2):e+=t),3===r&&"!--"===e&&(r=4,h=h[0]);}return p(),h}(s)),r),arguments,[])).length>1?r:r[0]}const STYLE_PREFIX = 'extml-style-';

function composeStyleInner(cssContent, tag) {
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

function createStyle() {
    if (!this.stylesheet) return;
    let id = this.getId();
    let styleElement = document.createElement('style');
    styleElement.id = STYLE_PREFIX + id;
    styleElement.innerHTML = composeStyleInner(this.stylesheet, '#' + id);
    document.head.appendChild(styleElement);
}

function destroyStyle() {
    if (!this.stylesheet) return;
    document.getElementById(STYLE_PREFIX + this.getId()).remove();
}function isEvent(prop) {
    return prop.startsWith('on')
}

function extractListenerName(prop) {
    return prop.substring(2)
}

function createEventObject(name, handle) {
    let event = {};
    event[name] = handle;
    return event;
}

function addEvent(componentConfig, eventObject) {
    componentConfig.listeners.push(eventObject);
}function createComponentConfig(type, props, children, propsFunction) {
    let componentConfig = {
        xtype: type.toLowerCase(),
        listeners: [
            createEventObject('initialize', createStyle),
            createEventObject('destroy', destroyStyle)
        ]
    };

    props = Object.assign({}, props, propsFunction);

    for (let prop in props) {
        if (isEvent(prop)) {
            addEvent(
                componentConfig,
                createEventObject(extractListenerName(prop), props[prop])
            );
        } else {
            componentConfig[prop] = props[prop];
        }
    }

    children.forEach(child => {
        if (typeof child === 'string') {
            if (!componentConfig.html)
                componentConfig.html = '';
            componentConfig.html += child;
        } else {
            if (!componentConfig.items)
                componentConfig.items = [];
            componentConfig.items.push(child);
        }
    });

    return componentConfig
}

function _h(type, props, ...children) {
    if (type === 'style') {
        return {isStyle: true, content: children[0] || ''}
    } else if (typeof type === 'function') {
        return createComponentConfig(type.name, type(props), children, props)
    }
    return createComponentConfig(type, props, children);
}

function h(strings, ...values) {
    let parsed = htm.bind(_h)(strings, ...values);
    //get style by component definition
    if (parsed.length > 1 && parsed[0].isStyle) {
        let styleContent = parsed[0].content;
        parsed = parsed[1];
        parsed.stylesheet = styleContent;
    }
    return parsed
}exports.h=h;}));