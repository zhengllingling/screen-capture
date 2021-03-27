import { autoUpdater } from "electron-updater";
import { ipcMain, BrowserWindow } from "electron";

/**
 * -1 检查更新失败 0 正在检查更新 1 检测到新版本，准备下载 2 未检测到新版本 3 下载中 4 下载完成
 * 负责向渲染进程发送信息
 */
function Message(mainWin, type, data){
    const sendData = {
        state: type,
        msg: data
    }
    mainWin.webContents.send("updateMsg", sendData);
}

export class Update {
    constructor(mainWin,feedUrl){
        this.mainWin = mainWin;
        // 在下载之前将autoDownload属性设置成false，通过渲染进程触发主进程事件来实现这一设置（将自动更新设置成false）
        autoUpdater.autoDownload = false;
        autoUpdater.setFeedURL(feedUrl);
        this.start();
        this.allow();
        this.unallowed();
        this.listen();
        this.downloaded();
        this.error();
        this.update();
        this.downloadUpdate();
    }
    // 开始检查更新时触发
    start(){
        autoUpdater.on("checking-for-update", (event,arg)=>{
            console.log(`checking-for-update：event ${event}  arg ${arg}`);
            Message(this.mainWin, 0);
        });
    }
    // 发现可更新数据时触发，进行相关操作
    allow(){
        autoUpdater.on("update-available", (event, arg)=>{
            console.log(`update-available：event ${event}  arg ${arg}`);
            Message(this.mainWin,1);
        });
    }
    // 没有可更新数据时触发，进行相关操作
    unallowed(){
        autoUpdater.on("update-not-available", (event,arg)=>{
            console.log(`update-not-available：event ${event}  arg ${arg}`);
            Message(this.mainWin, 2);
        });
    }
    // 监听下载进度
    listen(){
        autoUpdater.on("download-progress", process=>{
            console.log(`download-progress：${process}`);
            Message(this.mainWin, 3, process);
        });
    }
    // 下载完成时触发
    downloaded(){
        autoUpdater.on("update-downloaded", (event,arg)=>{
            console.log(`update-downloaded：event ${event}  arg ${arg}`);
            Message(this.mainWin, 4);
        });
    }
    error(){
        autoUpdater.on("error", err=>{
            console.log(`err：${err}`);
            Message(this.mainWin, -1, "检查更新失败");
        });
    }
    // 退出并安装
    update(){
        ipcMain.on("confirm-update", ()=>{
            autoUpdater.quitAndInstall();
        });
    }
    // 手动下载更新文件
    downloadUpdate(){
        ipcMain.on("confirm-downloadUpdate", ()=>{
            autoUpdater.doDownloadUpdate();
        });
    }
}