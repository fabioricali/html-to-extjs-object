export function detectClassType(xtype) {
    if (xtype.startsWith('ext-')) {
        xtype = xtype.split('ext-')[1];
    } else if (!xtype.startsWith('html-')) {
        xtype = 'html-' + xtype;
    }
    return xtype;
}