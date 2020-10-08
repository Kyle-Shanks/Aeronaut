export default class Commander {
    constructor(mini) {
        this.el = document.createElement('div');
        this.el.id = 'commander';

        this.input = document.createElement('input');

        this.history = [];
        this.historyIndex = 0;

        this.input.onkeydown = (e) => {
            switch (e.key) {
                case 'Enter': e.preventDefault(); this.run(mini); break;
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

    run(mini) {
        if (this.input.value) {
            if (this.input.value !== this.history[this.history.length - 1]) {
                this.history.push(this.input.value);
            }
            this.historyIndex = this.history.length;

            mini.mixer.run(this.input.value);
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