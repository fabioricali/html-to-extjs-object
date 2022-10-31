export function createContext() {
    Ext.getApplication().context = Ext.getApplication().context || {};
    this.context = Ext.getApplication().context;
    if (this.contextName) {
        this.context[this.contextName] = this.context[this.contextName] || {};
        this.context[this.contextName][this.getItemId()] = this;
        this.query('*').forEach(item => {
            this.context[this.contextName][item.getItemId()] = item;
        });
    }
}