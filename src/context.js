export function createContext() {
    Ext.getApplication().context = Ext.getApplication().context || {};
    this.context = Ext.getApplication().context;
    let controller = this.getController();
    //append context to controller
    if (controller) {
        controller.context = this.context;
    }
    if (this.contextName) {
        if (this.context[this.contextName] !== undefined)
            throw new Error('A context with this name already exists: ' + this.contextName);
        this.context[this.contextName] = /*this.context[this.contextName] ||*/ {};
        this.context[this.contextName][this.getItemId()] = this;
        this.query('*').forEach(item => {
            this.context[this.contextName][item.getItemId()] = item;
        });
    }
}