const path = require("path");

function resolve(dir) {
    return path.join(__dirname, dir);

}

module.exports = {
    publicPath: "/screen-capture",
    chainWebpack: config => {
        config.resolve.alias
        .set("@", resolve("src"))
        const oneOfsMap = config.module.rule("scss").oneOfs.store;
        oneOfsMap.forEach(item => {
          item
            .use("sass-resources-loader")
            .loader("sass-resources-loader")
            .options({
              resources: "./src/style/module/index.scss"
            })
            .end();
        });
    },
    pluginOptions: {
        electronBuilder: {
            // appId: "", // 项目唯一标识
            productName: "screen-capture", // 项目名称
            nodeIntegration: true,
            builderOptions: {
                // win: { // windows 环境配置
                //     icon: "", // 图标路径
                //     extraResources: { // 拷贝静态文件到制定位置
                //         from: "", // 从哪（路径地址）
                //         to: "" // 到哪（路径地址）
                //     }
                // },
                nsis: {
                    "oneClick": false, // 一键安装
                    "perMachine": true, // 是否开启安装时权限限制(此电脑或当前用户)
                    "allowElevation": true, // 允许请求提升。如果过为false，则用户必须使用提升的权限重新启动安装程序
                    "allowToChangeInstallationDirectory": true, // 允许修改安装目录
                    // "installerIcon": "", // 安装图标
                    // "unInstallerIcon": "", // 卸载图标
                    // "installerHeaderIcon": "", // 安装时头部图标
                    "createDesktopShortcut": true, // 创建桌面图标
                    "createStartMenuShortcut": true, // 创建开始菜单图标
                    // "shortcutName": "xxx", // 图标名称

                },
                // publish: [ // 自动升级配置
                //     {
                //         provider: "generic",
                //         url: ""  // 服务器放文件的地址
                //     }
                // ]
            }
        }
    }
}
