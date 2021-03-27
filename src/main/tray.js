const { nativeImage, Tray, ipcMain, Menu } = require('electron');
const path = require('path');
const trayImg = nativeImage.createFromPath(path.join(__static, './images/tray/logo.png'));
let tray = null;
const createTray = () => {
  tray = new Tray(trayImg);
  tray.on('click', () => {
    ipcMain.emit('capture-screen')
  });
}

module.exports = createTray;
