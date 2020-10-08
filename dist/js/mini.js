import Listener from './listener.js';
import Mixer from './mixer.js';
import Commander from './commander.js';

export default class Mini {
    constructor() {
        this.el = document.createElement('div');
        this.el.id = 'mini';

        this.mixer = null;
        this.listener = null;
        this.commander = null;
    }

    install(host) {
        console.info('Mini is installing...');

        this.mixer = new Mixer(this);
        this.listener = new Listener(this);
        this.commander = new Commander(this);

        host.appendChild(this.el);

        this.mixer.install(this.el);
        this.commander.install(this.el);
    }

    start() {
        console.info('Mini is starting...');

        this.mixer.start();
        this.commander.start();
    }
}