export function detectClassType(xtype) {
    if (xtype.startsWith('ext-')) {
        xtype = xtype.split('ext-')[1];
    } else {
        xtype = 'html-' + xtype;
    }
    return xtype;
}