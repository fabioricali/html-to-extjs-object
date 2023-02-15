export function createContext() {
    Ext.getApplication().context = Ext.getApplication().context || {};
    this.context = Ext.getApplication().context;
    let controller = this.getController();
    //append context to controller

    let children = this.query ? this.query('*') : [];
    if (this.contextName) {
        if (this.context[this.contextName] !== undefined) {
            // throw new Error('A context with this name already exists: ' + this.contextName);
            console.error('A context with this name already exists: ' + this.contextName, 'itemId:', this.getItemId());
        }
        this.context[this.contextName] = /*this.context[this.contextName] ||*/ {};
        this.context[this.contextName][this.getItemId()] = this;
        children.forEach(item => {
            this.context[this.contextName][item.getItemId()] = item;
        });
    }

    if (this.isContext) {
        this.selfContext = {};
        this.selfContext[this.getItemId()] = this;
        children.forEach(item => {
            this.selfContext[item.getItemId()] = item;
        });
    }

    if (controller) {
        controller.context = this.context;
        controller.selfContext = this.selfContext;
        controller.props = controller.view.props;
    }
}

export function destroyContext() {
    Ext.getApplication().context = Ext.getApplication().context || {};
    if (this.contextName) {
        delete Ext.getApplication().context[this.contextName];
    }
}