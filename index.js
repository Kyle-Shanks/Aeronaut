const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');

require('electron').protocol.registerSchemesAsPrivileged([
    { scheme: 'js', privileges: { standard: true, secure: true } }
]);

function protocolHandler(request, respond) {
    try {
        let pathname = request.url.replace(/^js:\/*/, '');
        let filename = path.resolve(app.getAppPath(), pathname);
        respond({ mimeType: 'text/javascript', data: require('fs').readFileSync(filename) });
    } catch (e) {
        console.error(e, request);
    }
}

app.on('ready', () => {
    require('electron').protocol.registerBufferProtocol('js', protocolHandler);

    app.win = new BrowserWindow({
        width: 364,
        height: 180,
        minWidth: 332,
        minHeight: 148,
        backgroundColor: '#000',
        icon: { darwin: 'icon.icns', linux: 'icon.png', win32: 'icon.ico' }[process.platform] || 'icon.ico',
        resizable: true,
        frame: process.platform !== 'darwin',
        skipTaskbar: process.platform === 'darwin',
        autoHideMenuBar: process.platform === 'darwin',
        webPreferences: { zoomFactor: 1.0, nodeIntegration: true, backgroundThrottling: false },
    });

    app.win.loadFile('dist/index.html');

    app.win.on('closed', () => { win = null; app.quit(); });

    app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
    app.on('activate', () => { app.win === null ? createWindow() : app.win.show(); });
})

app.inspect = () => { app.win.toggleDevTools(); }

app.toggleFullscreen = () => { app.win.setFullScreen(!app.win.isFullScreen()); }

app.toggleVisible = function () {
    if (process.platform === 'darwin') {
        (app.win.isVisible() && !app.win.isFullScreen()) ? app.win.hide() : app.win.show();
    } else {
        app.win.isMinimized() ? app.win.restore() : app.win.minimize();
    }
}

app.injectMenu = function (menu) {
    try {
        Menu.setApplicationMenu(Menu.buildFromTemplate(menu));
    } catch (err) {
        console.warn('Cannot inject menu.');
    }
}