const { app, BrowserWindow } = require('electron')

// You have to pass the directory that contains widevine library here, it is
// * `libwidevinecdm.dylib` on macOS,
// * `widevinecdm.dll` on Windows.
app.commandLine.appendSwitch('widevine-cdm-path', 'C:/Program Files (x86)/Google/Chrome/Application/77.0.3865.90/WidevineCdm/_platform_specific/win_x64/widevinecdm.dll')
// The version of plugin can be got from `chrome://components` page in Chrome.
app.commandLine.appendSwitch('widevine-cdm-version', '4.10.1503.4')

function createWindow () {
    // Create the browser window.
    let win = new BrowserWindow({
      width: 1920,
      height: 1080,
      webPreferences: {
        nodeIntegration: true,
        plugins: true
      }
    })
    // and load the index.html of the app.
    win.loadFile('./app/pages/index.html')
}



app.on('ready', createWindow)