export function createContext() {
    Ext.getApplication().appContext = Ext.getApplication().appContext || {};
    this.appContext = Ext.getApplication().appContext;
    let controller = this.getController();
    //append context to controller

    let children = this.query ? this.query('*') : [];
    if (this.contextName) {
        if (this.appContext[this.contextName] !== undefined) {
            // throw new Error('A context with this name already exists: ' + this.contextName);
            console.error('A context with this name already exists: ' + this.contextName, 'itemId:', this.getItemId());
        }
        this.appContext[this.contextName] = /*this.context[this.contextName] ||*/ {};
        this.appContext[this.contextName][this.getItemId()] = this;
        children.forEach(item => {
            this.appContext[this.contextName][item.getItemId()] = item;
            item.appContext = this.appContext;
        });
    }

    //if (this.isContext) {
    if (!this.context) {
        this.context = {};
        this.context[this.getItemId()] = this;
        children.forEach(item => {
            this.context[item.getItemId()] = item;
            item.context = this.context;
        });
    }

    if (controller) {
        controller.appContext = this.appContext;
        controller.context = this.context;
        controller.props = controller.view.props;
    }
}

export function destroyContext() {
    Ext.getApplication().appContext = Ext.getApplication().appContext || {};
    if (this.contextName) {
        delete Ext.getApplication().appContext[this.contextName];
    }
    let itemId = this.getItemId();
    if (Ext.getApplication().appContext[itemId]) {
        delete Ext.getApplication().appContext[itemId];
    }
}