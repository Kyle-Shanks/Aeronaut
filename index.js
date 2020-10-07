// const { app, BrowserWindow } = require('electron')

// function createWindow () {
//   // Create the browser window.
//   const win = new BrowserWindow({
//     width: 800,
//     height: 600,
//     webPreferences: {
//       nodeIntegration: true
//     }
//   })

//   // and load the index.html of the app.
//   win.loadFile('index.html')

//   // Open the DevTools.
//   win.webContents.openDevTools()
// }

// // This method will be called when Electron has finished
// // initialization and is ready to create browser windows.
// // Some APIs can only be used after this event occurs.
// app.whenReady().then(createWindow)

// // Quit when all windows are closed, except on macOS. There, it's common
// // for applications and their menu bar to stay active until the user quits
// // explicitly with Cmd + Q.
// app.on('window-all-closed', () => {
//   if (process.platform !== 'darwin') {
//     app.quit()
//   }
// })

// app.on('activate', () => {
//   // On macOS it's common to re-create a window in the app when the
//   // dock icon is clicked and there are no other windows open.
//   if (BrowserWindow.getAllWindows().length === 0) {
//     createWindow()
//   }
// })

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.


// --------------------------

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
        width: 445,
        height: 210,
        minWidth: 200,
        minHeight: 210,
        // backgroundColor: '#000',
        backgroundColor: '#aaa',
        icon: { darwin: 'icon.icns', linux: 'icon.png', win32: 'icon.ico' }[process.platform] || 'icon.ico',
        resizable: true,
        frame: process.platform !== 'darwin',
        skipTaskbar: process.platform === 'darwin',
        autoHideMenuBar: process.platform === 'darwin',
        webPreferences: { zoomFactor: 1.0, nodeIntegration: true, backgroundThrottling: false }
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
        Menu.setApplicationMenu(Menu.buildFromTemplate(menu))
    } catch (err) {
        console.warn('Cannot inject menu.')
    }
}