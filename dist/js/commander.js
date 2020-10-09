export default class Commander {
    constructor(aeronaut) {
        this.el = document.createElement('div');
        this.el.id = 'commander';

        this.input = document.createElement('input');

        this.history = [];
        this.historyIndex = 0;

        this.input.onkeydown = (e) => {
            switch (e.key) {
                case 'Enter': e.preventDefault(); this.run(aeronaut); break;
                case 'ArrowDown': e.preventDefault(); this.historyDown(); break;
                case 'ArrowUp': e.preventDefault(); this.historyUp(); break;
            }
        }
    }

    install(host) {
        console.info('Commander is installing...');
        this.el.appendChild(this.input);
        host.appendChild(this.el);
    }

    start() {
        console.info('Commander is starting...');
        this.input.focus();
    }

    run(aeronaut) {
        const val = this.input.value.replace(/\s+/g, '');
        if (val) {
            if (val !== this.history[this.history.length - 1]) {
                this.history.push(val);
            }
            this.historyIndex = this.history.length;

            aeronaut.mixer.run(val);
            this.input.value = '';
        }
    }

    historyDown() {
        if (this.historyIndex === this.history.length) return;
        this.historyIndex += 1;

        this.input.value = this.historyIndex === this.history.length
            ? ''
            : this.history[this.historyIndex];
    }

    historyUp() {
        if (this.history.length && this.historyIndex > 0) {
            this.input.value = this.history[--this.historyIndex];
        }
    }
}