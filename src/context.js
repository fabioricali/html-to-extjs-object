export function createContext() {
    if (this.contextName) {
        Ext.getApplication().context = Ext.getApplication().context || {};
        Ext.getApplication().context[this.contextName] = {};
        this.context = Ext.getApplication().context;
        this.context[this.contextName][this.getItemId()] = this;
        this.query('*').forEach(item => {
            this.context[this.contextName][item.getItemId()] = item;
        });
    }
}