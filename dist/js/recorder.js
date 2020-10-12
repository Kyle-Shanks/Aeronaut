const { dialog } = require('@electron/remote');
const fs = require('fs');

export default class Recorder {
    constructor(aeronaut) {
        this.el = document.createElement('div');
        this.el.id = 'recorder';
        this.el.textContent = '•';

        this.AC = aeronaut.AC;
        this.aeronautRef = aeronaut;

        this.hook = null;
        this.recorder = null;
        this.chunks = [];
        this.isRecording = false;
    }

    install(host) {
        console.info('Recorder', 'Installing..');

        this.hook = this.AC.createMediaStreamDestination();
        this.recorder = new MediaRecorder(this.hook.stream);
        this.aeronautRef.mixer.masterVolume.connect(this.hook);

        this.recorder.onstop = (evt) => {
            const blob = new Blob(this.chunks, { type: 'audio/opus; codecs=opus' });
            this.save(blob);
        }

        this.recorder.ondataavailable = (evt) => { this.chunks.push(evt.data); };
        host.appendChild(this.el);
    }

    start() {
        if (this.isRecording) return;

        console.info('Recorder', 'Starting..');
        this.chunks = [];
        this.isRecording = true;
        this.recorder.start();
        this.el.className = 'recording';
    }

    stop() {
        if (!this.isRecording) return;

        console.info('Recorder', 'Stopping..');
        this.isRecording = false;
        this.recorder.stop();
        this.el.className = '';
    }

    toggle() { this.isRecording ? this.stop() : this.start(); }

    save(blob) {
        dialog.showSaveDialog(
            {
                filters: [{ name: 'Audio File', extensions: ['opus'] }],
            }
        ).then((path) => {
            if (path === undefined || path.canceled) return;
            this.write(path, blob);
        });
    }

    write(path, blob) {
        const reader = new FileReader();
        reader.onload = () => {
            const buffer = new Buffer.from(reader.result);
            fs.writeFile(path.filePath, buffer, {}, (err, res) => {
                if (err) { console.error(err); return; }
                console.info('Recorder', 'Export complete.');
            })
        }
        reader.readAsArrayBuffer(blob);
    }
}
