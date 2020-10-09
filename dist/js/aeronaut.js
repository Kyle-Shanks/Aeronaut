import Listener from './listener.js';
import Mixer from './mixer.js';
import Recorder from './recorder.js';
import Commander from './commander.js';

export default class Aeronaut {
    constructor() {
        this.el = document.createElement('div');
        this.el.id = 'aeronaut';

        this.AC = new AudioContext();

        this.mixer = null;
        this.listener = null;
        this.recorder = null;
        this.commander = null;
    }

    install(host) {
        console.info('Aeronaut is installing...');

        this.mixer = new Mixer(this);
        this.listener = new Listener(this);
        this.recorder = new Recorder(this);
        this.commander = new Commander(this);

        host.appendChild(this.el);

        this.mixer.install(this.el);
        this.recorder.install(this.el);
        this.commander.install(this.el);
    }

    start() {
        console.info('Aeronaut is starting...');

        this.mixer.start();
        this.commander.start();
    }
}