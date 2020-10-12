const { app } = require('@electron/remote');

export default class Controller {
    constructor() {
        this.menu = { default: {} };
        this.mode = 'default';
    }

    add(mode, cat, label, fn, accelerator) {
        if (!this.menu[mode]) this.menu[mode] = {};
        if (!this.menu[mode][cat]) this.menu[mode][cat] = {};
        this.menu[mode][cat][label] = { fn, accelerator };
    }

    addRole(mode, cat, label) {
        if (!this.menu[mode]) this.menu[mode] = {};
        if (!this.menu[mode][cat]) this.menu[mode][cat] = {};
        this.menu[mode][cat][label] = { role: label };
    }

    format() {
        const f = [];
        const m = this.menu[this.mode];
        for (const cat in m) {
            const submenu = [];
            for (const name in m[cat]) {
                const option = m[cat][name];
                if (option.role) {
                    submenu.push({ role: option.role });
                } else {
                    submenu.push({ label: name, accelerator: option.accelerator, click: option.fn });
                }
            }
            f.push({ label: cat, submenu: submenu });
        }
        return f;
    }

    commit() { app.injectMenu(this.format()); }
}

