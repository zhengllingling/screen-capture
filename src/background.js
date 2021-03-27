'use strict'

import { app, protocol, BrowserWindow, ipcMain, screen } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'
const isDevelopment = process.env.NODE_ENV !== 'production'

// 检查更新类
import { Update } from "@/main/update";
import createTray from "./main/tray";

protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
])

let win = null;

async function createWindow (width, height) {
  win = new BrowserWindow({
    width,
    height,
    resizable: false,
    movable: false,
    center: true,
    frame: false,
    transparent: true,
    fullscreen: true,
    alwaysOnTop: false,
    skipTaskbar: true,
    hasShadow: false,
    webSecurity: false,
    webPreferences: {
      webSecurity: false,
      nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION
    },
    show: false,
    paintWhenInitiallyHidden: false
  })

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
    if (!process.env.IS_TEST) win.webContents.openDevTools()
  } else {
    createProtocol('app')
    win.loadURL('app://./index.html')
  }
}

// app.on('window-all-closed', () => {
//   if (process.platform !== 'darwin') {
//     app.quit()
//   }
// })

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    try {
      await installExtension(VUEJS_DEVTOOLS)
    } catch (e) {
      console.error('Vue Devtools failed to install:', e.toString())
    }
  }
  createTray()
  const { size } = screen.getPrimaryDisplay();
  const { width, height } = size;
  createWindow(width, height);
  ipcMain.on('capture-screen', () => {
    win.webContents.send('handle-screen-capture')
    win.show();
  })
  ipcMain.on('quit-app', () => {
    app.quit();
  })
  ipcMain.on('close-app', () => {
    win.hide();
  })
})

if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}
