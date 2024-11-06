const STYLE_PREFIX = 'extml-style-';

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

    this.stylesheetStateListeners = [];
    let stylesheet = ''
    if (this.stylesheet.some(
        (item) => typeof item === 'function' && item.$$isState === true
    )) {
        let stateItems = [];
        let buildStyle = () => this.stylesheet.map(item => {
            if (typeof item === 'function' && item.$$isState) {
                stateItems.push(item);
                return item()
            } else {
                return item
            }
        }).join('');

        stylesheet = buildStyle()

        stateItems.forEach(item => {
            this.stylesheetStateListeners.push(item.$$subscribe(value => {
                styleElement.innerHTML = composeStyleInner(buildStyle(), '#' + id);
            }))
        })
    } else {
        stylesheet = this.stylesheet.join('')
    }

    styleElement.innerHTML = composeStyleInner(stylesheet, '#' + id);
    document.head.appendChild(styleElement);
}

export function destroyStyle() {
    if (!this.stylesheet) return;
    if (this.stylesheetStateListeners) {
        this.stylesheetStateListeners.forEach(listener => listener());
    }
    document.getElementById(STYLE_PREFIX + this.getId()).remove();
}