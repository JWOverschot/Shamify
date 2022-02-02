// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
const path = require('path');
const url = require('url');

import { Titlebar, Color } from 'custom-electron-titlebar'
import titlebar from 'custom-electron-titlebar/dist/titlebar';
import { ipcRenderer } from 'electron'

let titleBar: titlebar

window.addEventListener('DOMContentLoaded', () => {
  // new customTitlebar.Titlebar({
  //   backgroundColor: customTitlebar.Color.fromHex('#282759')
  // });

  // new Titlebar({
  //   backgroundColor: Color.fromHex('#282759')
  // })

  titleBar = new Titlebar({
    backgroundColor: Color.fromHex("#282759"),
    onMinimize: () => ipcRenderer.send('window-minimize'),
    onMaximize: () => ipcRenderer.send('window-maximize'),
    onClose: () => ipcRenderer.send('window-close'),
    isMaximized: () => ipcRenderer.sendSync('window-is-maximized'),
    //onMenuItemClick: (commandId) => ipcRenderer.send('menu-event', commandId)
  });

  //   const replaceText = (selector: any, text: any) => {
  //     const element = document.getElementById(selector)
  //     if (element) element.innerText = text
  //   }

  //   for (const type of ['chrome', 'node', 'electron']) {
  //     replaceText(`${type}-version`, process.versions[type])
  //   }
})

// ipcRenderer.on('titlebar-menu', (event, menu) => {
//   titleBar.updateMenu(menu)  // Add this for update menu
// })