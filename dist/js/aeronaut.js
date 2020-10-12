import Listener from './listener.js';
import Mixer from './mixer.js';
import Recorder from './recorder.js';
import Commander from './commander.js';

const { webFrame } = require('electron');

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

        const zoomFactor = Number(localStorage.getItem('zoomFactor'));
        webFrame.setZoomFactor(zoomFactor);
    }

    modZoom(mod = 0, set = false) {
        const currentZoomFactor = webFrame.getZoomFactor();
        const newZoomFactor = set ? mod : currentZoomFactor + mod;
        webFrame.setZoomFactor(newZoomFactor);
        localStorage.setItem('zoomFactor', newZoomFactor);
    }
}